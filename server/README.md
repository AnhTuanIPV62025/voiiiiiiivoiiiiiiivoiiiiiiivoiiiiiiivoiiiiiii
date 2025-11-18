# 🎙️ TTS API Server - Backend Proxy cho OpenAI Text-to-Speech

Backend API server để xử lý OpenAI TTS requests từ frontend.

## 📋 Yêu cầu

- Node.js 20+
- OpenAI API Key (https://platform.openai.com/api-keys)

## 🚀 Cài đặt

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Cấu hình API Key

Tạo file `.env`:

```bash
cp .env.example .env
```

Mở `.env` và thêm API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3001
```

### 3. Chạy server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3001`

## 📡 API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "TTS API Proxy"
}
```

### Generate Speech

```
POST /api/tts/openai
Content-Type: application/json

{
  "text": "Hello world",
  "voice": "alloy",    // optional: alloy, echo, fable, onyx, nova, shimmer
  "model": "tts-1"     // optional: tts-1, tts-1-hd
}
```

Response: `audio/mpeg` (MP3 file)

## 🔒 Bảo mật

- API key được lưu trong `.env` (KHÔNG commit vào git)
- CORS enabled cho frontend
- Request validation
- Rate limiting (recommended để thêm)

## 💰 Chi phí OpenAI TTS

| Model | Quality | Giá |
|-------|---------|-----|
| `tts-1` | Standard | $15.00 / 1M characters |
| `tts-1-hd` | HD | $30.00 / 1M characters |

**Ví dụ:**
- 1000 requests × 500 ký tự = 500,000 ký tự
- Chi phí: ~$7.50 (tts-1) hoặc ~$15 (tts-1-hd)

## 🎤 Giọng có sẵn

- `alloy` - Trung tính, cân bằng
- `echo` - Nam, trầm
- `fable` - Anh, ấm áp
- `onyx` - Nam, mạnh mẽ
- `nova` - Nữ, trẻ trung
- `shimmer` - Nữ, nhẹ nhàng

## 🐛 Debug

Kiểm tra logs:
```bash
# Server logs sẽ hiện:
[TTS] Generating speech: Hello... | Voice: alloy | Model: tts-1
[TTS] Success: 12345 bytes | Characters: 11
```

## 📊 Monitoring (Khuyến nghị)

Thêm monitoring để track usage:
- Số requests/ngày
- Tổng characters đã xử lý
- Chi phí ước tính

## ⚙️ Tùy chọn nâng cao

### Thêm Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/tts/', limiter);
```

### Thêm Authentication

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.post('/api/tts/openai', authenticateToken, async (req, res) => {
  // ...
});
```

## 🚀 Deploy lên VPS

Xem file `install.sh` để auto deploy cả frontend và backend.

Server sẽ chạy với PM2 để auto-restart.

## ❓ Troubleshooting

**Error: "OpenAI API key not configured"**
- Kiểm tra file `.env` có tồn tại không
- Kiểm tra `OPENAI_API_KEY` đã set đúng chưa

**Error: "Invalid API key"**
- API key không đúng hoặc đã hết hạn
- Tạo key mới tại: https://platform.openai.com/api-keys

**Error: "Rate limit exceeded"**
- Đã vượt quá giới hạn requests của OpenAI
- Chờ hoặc upgrade plan

## 📝 License

MIT
