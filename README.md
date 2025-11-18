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

### 🚀 Deploy VPS Ubuntu 22 - Chỉ 1 lệnh!

**Cài đặt tự động trên VPS (1CPU-1GB RAM):**

```bash
curl -fsSL https://raw.githubusercontent.com/AnhTuanIPV62025/voiiiiiiivoiiiiiiivoiiiiiiivoiiiiiiivoiiiiiii/claude/adapt-code-web-01QBd2N1xScVK2PHF8CtpxsK/install.sh | sudo bash
```

Script tự động thực hiện:
- ✅ Cài đặt Node.js 20 + Nginx
- ✅ Thiết lập Swap 1GB (quan trọng!)
- ✅ Clone repo & build ứng dụng
- ✅ Cấu hình Nginx với Gzip
- ✅ Khởi chạy website

**Sau khi hoàn tất (~2-3 phút):**
- Truy cập: `http://IP-CUA-VPS`
- Web root: `/var/www/tts-app`

📖 **Hướng dẫn chi tiết:** [DEPLOY_VPS.md](DEPLOY_VPS.md)

### Deploy nền tảng khác

- **Vercel** - Khuyên dùng cho Serverless
- **Netlify** - Drag & drop dist/
- **GitHub Pages** - Free static hosting
- **Cloudflare Pages** - Fast CDN

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
