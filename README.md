# Trình Đọc Văn Bản AI - Text to Speech Web App

Ứng dụng web chuyển đổi văn bản thành giọng nói sử dụng **Web Speech API** của trình duyệt.

## ✨ Tính năng

- 🎤 **Miễn phí hoàn toàn** - Không cần API key hay đăng ký
- 🌐 **Chạy trực tiếp trên trình duyệt** - Sử dụng Web Speech API
- 🇻🇳 **Hỗ trợ tiếng Việt** - Cùng nhiều ngôn ngữ khác
- 🎨 **Giao diện đẹp mắt** - Dark/Light mode
- 📁 **Hỗ trợ upload file** - Đọc từ file .txt và .docx
- ⚡ **Tốc độ nhanh** - Không cần gọi API bên ngoài

## 🚀 Chạy ứng dụng

### Prerequisites
- Node.js (v16 trở lên)

### Cài đặt

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Chạy development server:
   ```bash
   npm run dev
   ```

4. Mở trình duyệt tại: `http://localhost:3000`

### Build cho production

```bash
npm run build
npm run preview
```

## 🌐 Deploy lên Web

Ứng dụng có thể deploy lên các nền tảng:
- **Vercel** (khuyên dùng)
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

## 🔧 Công nghệ sử dụng

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Web Speech API

## 📝 Lưu ý

- Web Speech API hoạt động tốt nhất trên Chrome, Edge, và Safari
- Một số giọng nói yêu cầu kết nối internet
- Firefox có hỗ trợ hạn chế
