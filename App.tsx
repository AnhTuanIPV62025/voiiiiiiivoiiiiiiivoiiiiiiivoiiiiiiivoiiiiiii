
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateSpeech, getAvailableVoices, stopSpeech } from './services/speechService';
import {
    Voice,
    DEFAULT_TEXT,
    DEFAULT_SPEECH_SETTINGS,
    READING_STYLES,
    isSupportedLanguage,
    categorizeVietnameseVoice
} from './constants';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { ReadingStyleSelector } from './components/ReadingStyleSelector';
import { Loader } from './components/Loader';
import { ProgressBar } from './components/ProgressBar';
import { AudioRecorder, downloadAudioBlob } from './services/recordingService';

declare const mammoth: any;

const MAX_TEXT_LENGTH = 5000;

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [text, setText] = useState<string>(DEFAULT_TEXT);
    const [voices, setVoices] = useState<Voice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [readingStyle, setReadingStyle] = useState<keyof typeof READING_STYLES>('news');
    const [progress, setProgress] = useState<number>(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [enableRecording, setEnableRecording] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recorderRef = useRef<AudioRecorder | null>(null);

    // Load available voices from browser
    useEffect(() => {
        const loadVoices = async () => {
            try {
                const browserVoices = await getAvailableVoices();

                // Filter chỉ giữ 4 ngôn ngữ: Việt, Anh, Trung, Nhật
                const filtered = browserVoices.filter(v => isSupportedLanguage(v.lang || ''));

                const voiceList: Voice[] = filtered.map(v => {
                    const isVietnamese = v.lang?.startsWith('vi');
                    const voice: Voice = {
                        id: v.name,
                        name: v.name,
                        description: `${v.lang} - ${v.localService ? 'Local' : 'Online'}`,
                        lang: v.lang,
                        isDefault: v.default,
                        gender: v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('nữ') ? 'female' : 'male',
                    };

                    // Categorize Vietnamese voices by region
                    if (isVietnamese) {
                        voice.region = categorizeVietnameseVoice(v.name);
                    }

                    return voice;
                });

                // Prioritize Vietnamese voices, then English, Chinese, Japanese
                const viVoices = voiceList.filter(v => v.lang?.startsWith('vi'));
                const enVoices = voiceList.filter(v => v.lang?.startsWith('en'));
                const zhVoices = voiceList.filter(v => v.lang?.startsWith('zh'));
                const jaVoices = voiceList.filter(v => v.lang?.startsWith('ja'));

                const sortedVoices = [...viVoices, ...enVoices, ...zhVoices, ...jaVoices];

                setVoices(sortedVoices);

                // Set default voice (prefer Vietnamese)
                if (sortedVoices.length > 0) {
                    const defaultVoice = viVoices[0] || sortedVoices.find(v => v.isDefault) || sortedVoices[0];
                    setSelectedVoice(defaultVoice.id);
                }
            } catch (err) {
                console.error('Error loading voices:', err);
                setError('Không thể tải danh sách giọng nói. Vui lòng thử lại.');
            }
        };

        loadVoices();
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleGenerate = useCallback(async () => {
        if (!text.trim() || isLoading || isSpeaking) return;

        setIsLoading(true);
        setIsSpeaking(true);
        setError(null);
        setProgress(0);
        setAudioBlob(null);

        // Initialize recorder if recording is enabled
        let recorder: AudioRecorder | null = null;
        if (enableRecording) {
            recorder = new AudioRecorder();
            recorderRef.current = recorder;

            const started = await recorder.startRecording();
            if (!started) {
                setError('Không thể bắt đầu ghi âm. Vui lòng cho phép trình duyệt ghi âm tab.');
                setIsLoading(false);
                setIsSpeaking(false);
                return;
            }
        }

        try {
            // Sử dụng settings từ reading style đã chọn
            const styleSettings = READING_STYLES[readingStyle].settings;

            await generateSpeech(text, selectedVoice, {
                ...styleSettings,
                onProgress: (percent) => {
                    setProgress(percent);
                }
            });

            // Stop recording and save audio
            if (recorder) {
                const blob = await recorder.stopRecording();
                if (blob) {
                    setAudioBlob(blob);
                }
            }
        } catch (err) {
            console.error("Error generating speech:", err);
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');

            // Stop recording on error
            if (recorder) {
                await recorder.stopRecording();
            }
        } finally {
            setIsLoading(false);
            setIsSpeaking(false);
        }
    }, [text, selectedVoice, readingStyle, isLoading, isSpeaking, enableRecording]);

    const handleStop = useCallback(async () => {
        stopSpeech();
        setIsSpeaking(false);
        setIsLoading(false);

        // Stop recording if active
        if (recorderRef.current && recorderRef.current.isRecording()) {
            await recorderRef.current.stopRecording();
        }
    }, []);

    const handleDownload = useCallback(() => {
        if (audioBlob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            downloadAudioBlob(audioBlob, `speech-${timestamp}.webm`);
        }
    }, [audioBlob]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= MAX_TEXT_LENGTH) {
            setText(e.target.value);
        }
    }
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const processFile = (file: File) => {
        const fileName = file.name.toLowerCase();
        setError(null);

        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileText = e.target?.result as string;
                setText(fileText.substring(0, MAX_TEXT_LENGTH));
                setUploadedFileName(file.name);
            };
            reader.onerror = () => {
                setError('Không thể đọc tệp .txt. Vui lòng thử lại.');
            };
            reader.readAsText(file);
        } else if (fileName.endsWith('.docx')) {
            if (typeof mammoth === 'undefined') {
                setError('Không thể tải thư viện đọc tệp Word. Vui lòng kiểm tra kết nối mạng và thử lại.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then((result: { value: string; }) => {
                        setText(result.value.substring(0, MAX_TEXT_LENGTH));
                        setUploadedFileName(file.name);
                    })
                    .catch((err: any) => {
                        console.error("Error parsing .docx file:", err);
                        setError('Không thể đọc tệp .docx. Tệp có thể bị hỏng hoặc không được hỗ trợ.');
                    });
            };
            reader.onerror = () => {
                setError('Không thể đọc tệp. Vui lòng thử lại.');
            };
            reader.readAsArrayBuffer(file);
        } else if (fileName.endsWith('.doc')) {
             setError('Tệp .doc không được hỗ trợ trực tiếp. Vui lòng lưu tệp dưới dạng .docx hoặc .txt.');
        } else {
            setError('Vui lòng tải lên tệp có định dạng .txt hoặc .docx');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        processFile(file);
        event.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleClearText = () => {
        setText('');
        setUploadedFileName(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 text-gray-800 dark:text-white p-4 sm:p-6 md:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <Header theme={theme} toggleTheme={toggleTheme} />

                <main className="space-y-6 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-700">

                    {/* File Upload Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Tải lên file văn bản
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                                isDragging
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50'
                            }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".txt,.docx"
                                className="hidden"
                            />
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-gray-400 dark:text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <div className="text-center">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                                    >
                                        Chọn file
                                    </button>
                                    <span className="text-gray-600 dark:text-gray-400"> hoặc kéo thả vào đây</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Hỗ trợ: .txt, .docx (Tối đa {MAX_TEXT_LENGTH.toLocaleString()} ký tự)
                                </p>
                                {uploadedFileName && (
                                    <div className="flex items-center space-x-2 mt-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">{uploadedFileName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Text Input Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Hoặc nhập văn bản trực tiếp
                            </label>
                            {text && (
                                <button
                                    onClick={handleClearText}
                                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center space-x-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Xóa văn bản</span>
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={handleTextChange}
                                placeholder="Nhập văn bản cần chuyển đổi thành giọng nói..."
                                className="w-full h-48 p-4 bg-gray-50 dark:bg-slate-900/70 border-2 border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none text-lg placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                                {text.length} / {MAX_TEXT_LENGTH.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <ReadingStyleSelector selectedStyle={readingStyle} onSelectStyle={setReadingStyle} />

                    <VoiceSelector voices={voices} selectedVoice={selectedVoice} onSelectVoice={setSelectedVoice} />

                    {/* Recording Option */}
                    <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <input
                            type="checkbox"
                            id="enableRecording"
                            checked={enableRecording}
                            onChange={(e) => setEnableRecording(e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                        <label htmlFor="enableRecording" className="text-sm font-medium text-blue-900 dark:text-blue-200 cursor-pointer select-none">
                            🎙️ Ghi âm và tải về file audio (yêu cầu quyền ghi âm tab)
                        </label>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar progress={progress} isActive={isSpeaking} label="Tiến trình chuyển đổi" />

                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !text.trim() || voices.length === 0}
                                className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0M8.464 15.536a5 5 0 010-7.072" /></svg>
                                {isLoading ? 'Đang đọc...' : 'Đọc văn bản'}
                            </button>

                            {isSpeaking && (
                                <button
                                    onClick={handleStop}
                                    className="flex items-center justify-center px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-full hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                                    Dừng
                                </button>
                            )}

                            {/* Download Button - only show when audio is available */}
                            {audioBlob && !isSpeaking && (
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg animate-pulse"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Tải về Audio
                                </button>
                            )}
                        </div>

                        {isLoading && <Loader />}

                        {error && <div className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

                        {voices.length === 0 && (
                            <div className="text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg text-center">
                                Đang tải danh sách giọng nói...
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
