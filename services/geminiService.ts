
import { GoogleGenAI, Modality } from "@google/genai";
import { VOICES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateSpeech = async (text: string, voiceId: string): Promise<string> => {
  try {
    const selectedVoice = VOICES.find(v => v.id === voiceId);

    if (!selectedVoice) {
      throw new Error("Invalid voice selected.");
    }

    const voiceName = selectedVoice.baseVoice || selectedVoice.id;
    let promptText = text;

    // Add special instruction for the custom Vietnamese voice
    if (voiceId === 'Mai') {
      promptText = `Đọc với giọng nữ miền Nam ấm áp, truyền cảm để kể chuyện: ${text}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("Không nhận được dữ liệu âm thanh từ API.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Tạo giọng nói thất bại. Vui lòng kiểm tra API key và kết nối mạng.");
  }
};