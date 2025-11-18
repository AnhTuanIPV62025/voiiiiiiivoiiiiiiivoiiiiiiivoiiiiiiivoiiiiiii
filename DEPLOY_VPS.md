# 🚀 Hướng Dẫn Deploy trên VPS (1CPU-1GB)

## 📋 Yêu cầu

- **VPS** với một trong các OS sau:
  - Ubuntu 22.04 LTS ⭐ (Khuyến nghị)
  - Ubuntu 24.04 LTS
  - Debian 11 (Bullseye)
  - Debian 12 (Bookworm)
- **Cấu hình tối thiểu:** 1 CPU, 1GB RAM
- **Quyền:** sudo

> **Lưu ý:** Script `install.sh` tự động phát hiện OS và cài đặt phù hợp

---

## ⚡ Cách Nhanh Nhất: Sử dụng Auto Installer

**Chỉ 1 lệnh - tự động cài đặt toàn bộ:**

```bash
curl -fsSL https://raw.githubusercontent.com/AnhTuanIPV62025/voiiiiiiivoiiiiiiivoiiiiiiivoiiiiiiivoiiiiiii/claude/adapt-code-web-01QBd2N1xScVK2PHF8CtpxsK/install.sh | sudo bash
```

Script sẽ tự động:
- ✅ Phát hiện OS (Ubuntu/Debian)
- ✅ Cài Node.js 20
- ✅ Thiết lập Swap 1GB
- ✅ Clone repository
- ✅ Build ứng dụng
- ✅ Cấu hình Nginx
- ✅ Deploy và chạy

**Thời gian:** ~3-5 phút

**Hỗ trợ OS:**
- Ubuntu 22.04/24.04 LTS
- Debian 11/12

Sau khi chạy xong, truy cập: `http://IP-CUA-VPS`

---

## 🛠️ Hoặc Cài Đặt Thủ Công

### Bước 1: Chuẩn bị VPS

### 1.1 Update hệ thống

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Cài đặt Node.js 20

```bash
# Thêm NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Cài đặt Node.js
sudo apt-get install -y nodejs

# Kiểm tra version
node -v  # Nên là v20.x.x
npm -v
```

### 1.3 Thiết lập Swap (QUAN TRỌNG cho VPS 1GB)

```bash
# Chạy script tự động
sudo bash setup-swap.sh

# Hoặc chạy thủ công:
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10
```

Kiểm tra swap:
```bash
free -h
```

## 📦 Bước 2: Clone & Build

### 2.1 Clone repository

```bash
# SSH
git clone git@github.com:your-username/your-repo.git
cd your-repo

# Hoặc HTTPS
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2.2 Build ứng dụng

**Cách 1: Sử dụng deploy script (Khuyên dùng)**

```bash
chmod +x deploy-vps.sh
bash deploy-vps.sh
```

**Cách 2: Build thủ công**

```bash
# Cài dependencies
npm install

# Build với memory limit (cho VPS 1GB)
npm run build:vps

# Hoặc nếu có nhiều RAM hơn
npm run build
```

Build sẽ mất khoảng 1-2 phút. Kết quả sẽ trong folder `dist/`.

## 🌐 Bước 3: Deploy với Nginx

### 3.1 Cài đặt Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.2 Cấu hình Nginx

Tạo file config:

```bash
sudo nano /etc/nginx/sites-available/tts-app
```

Nội dung:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Hoặc IP của VPS

    root /var/www/tts-app;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/tts-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 Copy build files

```bash
sudo mkdir -p /var/www/tts-app
sudo cp -r dist/* /var/www/tts-app/
sudo chown -R www-data:www-data /var/www/tts-app
```

## 🔒 Bước 4: HTTPS với Let's Encrypt (Tùy chọn)

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto renew
sudo certbot renew --dry-run
```

## ⚡ Tối ưu hóa Performance

### Memory Usage

```bash
# Kiểm tra memory
free -h

# Kiểm tra processes
htop

# Clear cache nếu cần
sudo sync; echo 3 | sudo tee /proc/sys/vm/drop_caches
```

### Nginx Tuning

Thêm vào `/etc/nginx/nginx.conf`:

```nginx
worker_processes 1;  # 1 CPU
worker_connections 512;  # Giảm cho VPS nhỏ

# Trong http block
client_body_buffer_size 10K;
client_header_buffer_size 1k;
client_max_body_size 8m;
large_client_header_buffers 2 1k;
```

## 🔄 Update ứng dụng

```bash
cd /path/to/your-repo
git pull origin main
bash deploy-vps.sh
sudo cp -r dist/* /var/www/tts-app/
sudo systemctl reload nginx
```

## 📊 Monitoring

```bash
# Kiểm tra Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Kiểm tra resource usage
htop
free -h
df -h
```

## 🐛 Troubleshooting

### Build bị killed (Out of Memory)

```bash
# Kiểm tra swap
free -h

# Nếu không có swap, chạy:
sudo bash setup-swap.sh

# Build lại với memory limit thấp hơn
NODE_OPTIONS='--max-old-space-size=384' npm run build
```

### Nginx 403 Forbidden

```bash
# Kiểm tra permissions
ls -la /var/www/tts-app

# Fix permissions
sudo chown -R www-data:www-data /var/www/tts-app
sudo chmod -R 755 /var/www/tts-app
```

### Site không load

```bash
# Kiểm tra Nginx status
sudo systemctl status nginx

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Kiểm tra firewall
sudo ufw status
sudo ufw allow 'Nginx Full'
```

## 📈 Performance Tips

1. **Sử dụng CDN** - Cloudflare (miễn phí) để cache static files
2. **Enable Gzip** - Đã config sẵn trong Nginx
3. **Browser caching** - Đã config sẵn trong Nginx
4. **Swap file** - Bắt buộc cho VPS 1GB
5. **Monitoring** - Sử dụng `htop` để theo dõi resources

## ✅ Checklist

- [ ] VPS với OS được hỗ trợ (Ubuntu 22/24 hoặc Debian 11/12)
- [ ] Hệ thống đã update (`apt update && apt upgrade`)
- [ ] Node.js 20 đã cài đặt (`node -v`)
- [ ] Swap 1GB đã thiết lập (`free -h`)
- [ ] Repository đã clone
- [ ] Build thành công (`dist/` folder tồn tại)
- [ ] Nginx đã cài đặt và config
- [ ] Files đã copy vào `/var/www/tts-app`
- [ ] Site accessible qua browser
- [ ] (Optional) HTTPS đã setup

## 🎯 Expected Results

- Build time: 1-2 phút
- Bundle size: ~65KB gzipped
- Memory usage khi build: ~500-800MB (với swap)
- Site load time: <2 giây

---

**Lưu ý:** VPS 1GB RAM là cấu hình tối thiểu. Nếu build thường xuyên bị killed, khuyến nghị:
- Tăng swap lên 2GB
- Build trên máy local rồi upload dist/
- Upgrade VPS lên 2GB RAM
