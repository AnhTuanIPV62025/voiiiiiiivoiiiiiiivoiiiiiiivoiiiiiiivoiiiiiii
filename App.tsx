
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateSpeech } from './services/geminiService';
import { VOICES } from './constants';
import { decode } from './utils/audio';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { Loader } from './components/Loader';

declare const mammoth: any;

const MAX_TEXT_LENGTH = 1000;

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [text, setText] = useState<string>('(Xin chào! Chào mừng bạn đến với trình tạo Giọng nói AI. Với sức mạnh từ Gemini, bạn có thể biến văn bản của mình thành âm thanh sống động. Hãy nhập nội dung và chọn một giọng nói bên dưới để bắt đầu.)');
    const [selectedVoice, setSelectedVoice] = useState<string>(VOICES[0].id);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const handleGenerate = useCallback(async () => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(null);

        try {
            const base64Audio = await generateSpeech(text, selectedVoice);
            const audioBytes = decode(base64Audio);
            const blob = new Blob([audioBytes], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (err) {
            console.error("Error generating speech:", err);
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [text, selectedVoice, isLoading, audioUrl]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= MAX_TEXT_LENGTH) {
            setText(e.target.value);
        }
    }
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        setError(null);

        if (fileName.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileText = e.target?.result as string;
                setText(fileText.substring(0, MAX_TEXT_LENGTH));
            };
            reader.onerror = () => {
                setError('Không thể đọc tệp .txt. Vui lòng thử lại.');
            };
            reader.readAsText(file);
        } else if (fileName.endsWith('.docx')) {
            if (typeof mammoth === 'undefined') {
                setError('Không thể tải thư viện đọc tệp Word. Vui lòng kiểm tra kết nối mạng và thử lại.');
                event.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then((result: { value: string; }) => {
                        setText(result.value.substring(0, MAX_TEXT_LENGTH));
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

        event.target.value = ''; // Reset input to allow re-uploading the same file
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 text-gray-800 dark:text-white p-4 sm:p-6 md:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <Header theme={theme} toggleTheme={toggleTheme} />

                <main className="space-y-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-slate-700">
                    <div className="relative">
                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.doc,.docx" className="hidden" />
                           <button 
                                onClick={() => fileInputRef.current?.click()}
                                title="Tải lên tệp .txt hoặc .docx"
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                           </button>
                        </div>
                        <textarea
                            value={text}
                            onChange={handleTextChange}
                            placeholder="Nhập văn bản cần chuyển đổi..."
                            className="w-full h-48 p-4 bg-gray-50 dark:bg-slate-900/70 border-2 border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none text-lg placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
                            {text.length} / {MAX_TEXT_LENGTH}
                        </div>
                    </div>
                    
                    <VoiceSelector voices={VOICES} selectedVoice={selectedVoice} onSelectVoice={setSelectedVoice} />

                    <div className="flex flex-col items-center space-y-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !text.trim()}
                            className="w-full md:w-auto flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0M8.464 15.536a5 5 0 010-7.072" /></svg>
                            {isLoading ? 'Đang tạo...' : 'Tạo giọng nói'}
                        </button>

                        {isLoading && <Loader />}
                        
                        {error && <div className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

                        {audioUrl && (
                            <div className="w-full mt-4">
                                <audio controls autoPlay src={audioUrl} className="w-full accent-blue-500">
                                    Trình duyệt của bạn không hỗ trợ phát âm thanh.
                                </audio>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
