// Recording service for capturing audio output
// Note: Web Speech API doesn't natively support recording
// We'll track progress and provide download option

export interface RecordingOptions {
  enableRecording?: boolean;
  onProgress?: (percent: number) => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<boolean> {
    try {
      // Try to capture system audio (requires user permission)
      // Note: This is experimental and may not work on all browsers
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as any,
      });

      // Check if audio track exists
      const audioTracks = this.stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track available');
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Recording failed:', error);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }
}

// Helper function to download blob
export const downloadAudioBlob = (blob: Blob, filename: string = 'speech-audio.webm') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
