#!/bin/bash

# ============================================
# Auto Install Script - Text to Speech App
# Hỗ trợ: Ubuntu 22/24 LTS & Debian 11/12
# VPS 1CPU-1GB RAM (tối thiểu)
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        OS_VERSION=$VERSION_ID
    elif [ -f /etc/debian_version ]; then
        OS="Debian"
        OS_VERSION=$(cat /etc/debian_version)
    else
        OS="Unknown"
        OS_VERSION="Unknown"
    fi

    # Normalize OS name
    case "$OS" in
        *Ubuntu*)
            OS_TYPE="ubuntu"
            OS_NAME="Ubuntu"
            ;;
        *Debian*)
            OS_TYPE="debian"
            OS_NAME="Debian"
            ;;
        *)
            OS_TYPE="unsupported"
            OS_NAME="$OS"
            ;;
    esac
}

# Run detection
detect_os

# Configuration
REPO_URL="https://github.com/AnhTuanIPV62025/voiiiiiiivoiiiiiiivoiiiiiiivoiiiiiiivoiiiiiii.git"
BRANCH="claude/adapt-code-web-01QBd2N1xScVK2PHF8CtpxsK"
APP_DIR="/var/www/tts-app"
NGINX_CONFIG="/etc/nginx/sites-available/tts-app"
TEMP_DIR="/tmp/tts-app-install"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Text-to-Speech App - Auto Installer        ║${NC}"
echo -e "${BLUE}║   Ubuntu 22/24 | Debian 11/12 | 1CPU-1GB      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🔍 Phát hiện hệ điều hành: ${GREEN}${OS_NAME} ${OS_VERSION}${NC}"
echo ""

# Check if OS is supported
if [ "$OS_TYPE" = "unsupported" ]; then
    echo -e "${RED}❌ Hệ điều hành không được hỗ trợ: ${OS_NAME}${NC}"
    echo -e "${YELLOW}Script này chỉ hỗ trợ Ubuntu 22/24 hoặc Debian 11/12${NC}"
    exit 1
fi

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Script này cần chạy với quyền sudo${NC}"
    echo "Chạy lại với: sudo bash install.sh"
    exit 1
fi

# Get actual user (not root)
ACTUAL_USER=${SUDO_USER:-$USER}
if [ "$ACTUAL_USER" = "root" ]; then
    echo -e "${YELLOW}⚠️  Chạy trực tiếp bằng root. Khuyến nghị dùng sudo.${NC}"
fi

# Function: Check and install package
install_package() {
    PACKAGE=$1
    if ! command -v $PACKAGE &> /dev/null; then
        echo -e "${YELLOW}📦 Cài đặt $PACKAGE...${NC}"
        apt-get install -y $PACKAGE > /dev/null 2>&1
        echo -e "${GREEN}✓ $PACKAGE đã cài đặt${NC}"
    else
        echo -e "${GREEN}✓ $PACKAGE đã có sẵn${NC}"
    fi
}

# Step 1: Update system
echo -e "${BLUE}[1/8]${NC} Cập nhật hệ thống..."
if [ "$OS_TYPE" = "debian" ]; then
    apt-get update > /dev/null 2>&1
    # Debian: Install ca-certificates if needed for HTTPS
    apt-get install -y ca-certificates > /dev/null 2>&1
else
    apt-get update > /dev/null 2>&1
fi
echo -e "${GREEN}✓ Hệ thống đã cập nhật${NC}"

# Step 2: Install dependencies
echo -e "${BLUE}[2/8]${NC} Cài đặt dependencies..."
install_package curl
install_package git
install_package nginx

# Step 3: Install Node.js 20
echo -e "${BLUE}[3/8]${NC} Cài đặt Node.js 20..."
if ! command -v node &> /dev/null || [ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]; then
    echo "  Downloading Node.js setup script..."
    # NodeSource script works for both Ubuntu and Debian
    if [ "$OS_TYPE" = "debian" ]; then
        echo "  Cài đặt cho Debian..."
    else
        echo "  Cài đặt cho Ubuntu..."
    fi
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    echo -e "${GREEN}✓ Node.js $(node -v) đã cài đặt${NC}"
else
    echo -e "${GREEN}✓ Node.js $(node -v) đã có sẵn${NC}"
fi

# Step 4: Setup Swap
echo -e "${BLUE}[4/8]${NC} Thiết lập Swap (1GB)..."
CURRENT_SWAP=$(free -m | grep Swap | awk '{print $2}')

if [ "$CURRENT_SWAP" -eq 0 ]; then
    echo "  Tạo swap file..."
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile > /dev/null 2>&1
    swapon /swapfile

    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    sysctl vm.swappiness=10 > /dev/null 2>&1
    if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
        echo "vm.swappiness=10" >> /etc/sysctl.conf
    fi

    echo -e "${GREEN}✓ Swap 1GB đã thiết lập${NC}"
else
    echo -e "${GREEN}✓ Swap ${CURRENT_SWAP}MB đã có sẵn${NC}"
fi

# Step 5: Clone repository
echo -e "${BLUE}[5/8]${NC} Clone repository..."
rm -rf $TEMP_DIR
git clone -b $BRANCH $REPO_URL $TEMP_DIR > /dev/null 2>&1
echo -e "${GREEN}✓ Repository đã clone${NC}"

# Step 6: Build application
echo -e "${BLUE}[6/8]${NC} Build ứng dụng (có thể mất 1-2 phút)..."
cd $TEMP_DIR

# Install dependencies as normal user if possible
if [ "$ACTUAL_USER" != "root" ]; then
    su - $ACTUAL_USER -c "cd $TEMP_DIR && npm install" > /dev/null 2>&1 || npm install > /dev/null 2>&1
else
    npm install > /dev/null 2>&1
fi

# Build with memory limit
NODE_OPTIONS='--max-old-space-size=512' npm run build > /dev/null 2>&1

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build thất bại!${NC}"
    exit 1
fi

DIST_SIZE=$(du -sh dist | cut -f1)
echo -e "${GREEN}✓ Build thành công (${DIST_SIZE})${NC}"

# Step 7: Setup Nginx
echo -e "${BLUE}[7/8]${NC} Cấu hình Nginx..."

# Copy files
mkdir -p $APP_DIR
cp -r dist/* $APP_DIR/
chown -R www-data:www-data $APP_DIR

# Create nginx config
cat > $NGINX_CONFIG << 'NGINX_EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/tts-app;
    index index.html;

    server_name _;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_EOF

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# Test and reload nginx
nginx -t > /dev/null 2>&1
systemctl restart nginx
systemctl enable nginx > /dev/null 2>&1

echo -e "${GREEN}✓ Nginx đã cấu hình${NC}"

# Step 8: Cleanup
echo -e "${BLUE}[8/8]${NC} Dọn dẹp..."
rm -rf $TEMP_DIR
echo -e "${GREEN}✓ Cleanup hoàn tất${NC}"

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Final message
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 CÀI ĐẶT THÀNH CÔNG! 🎉           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}💻 Hệ điều hành:${NC}"
echo -e "   OS:         ${CYAN}${OS_NAME} ${OS_VERSION}${NC}"
echo -e "   Type:       ${CYAN}${OS_TYPE}${NC}"
echo ""
echo -e "${YELLOW}📊 Thông tin phần mềm:${NC}"
echo -e "   Node.js:    $(node -v)"
echo -e "   NPM:        $(npm -v)"
echo -e "   Swap:       $(free -h | grep Swap | awk '{print $2}')"
echo -e "   Nginx:      $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo -e "${YELLOW}🌐 Truy cập ứng dụng:${NC}"
echo -e "   ${BLUE}http://${SERVER_IP}${NC}"
if [ -n "$ACTUAL_USER" ] && [ "$ACTUAL_USER" != "root" ]; then
    echo -e "   ${BLUE}http://localhost${NC} (nếu truy cập local)"
fi
echo ""
echo -e "${YELLOW}📁 Đường dẫn:${NC}"
echo -e "   Web root:      $APP_DIR"
echo -e "   Nginx config:  $NGINX_CONFIG"
echo ""
echo -e "${YELLOW}🔧 Lệnh hữu ích:${NC}"
echo -e "   Restart Nginx:     sudo systemctl restart nginx"
echo -e "   Check Nginx logs:  sudo tail -f /var/log/nginx/access.log"
echo -e "   Check memory:      free -h"
echo -e "   Check disk:        df -h"
echo ""
echo -e "${GREEN}✨ Ứng dụng Text-to-Speech đã sẵn sàng trên ${OS_NAME}!${NC}"
echo ""
