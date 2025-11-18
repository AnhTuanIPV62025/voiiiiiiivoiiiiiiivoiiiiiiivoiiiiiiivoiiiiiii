#!/bin/bash

# ============================================
# Update Script - Cập nhật code sau khi đã cài
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Text-to-Speech App - Update Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Không tìm thấy package.json${NC}"
    echo "Hãy chạy script trong thư mục dự án"
    exit 1
fi

# Step 1: Pull latest code
echo -e "${BLUE}[1/5]${NC} Pull code mới nhất từ GitHub..."
git pull origin $(git branch --show-current)
echo -e "${GREEN}✓ Code đã được cập nhật${NC}"

# Step 2: Check for package.json changes
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo -e "${BLUE}[2/5]${NC} Phát hiện thay đổi dependencies, đang cài đặt..."
    npm install
    echo -e "${GREEN}✓ Dependencies đã cập nhật${NC}"
else
    echo -e "${BLUE}[2/5]${NC} Không có thay đổi dependencies"
    echo -e "${GREEN}✓ Skip cài đặt${NC}"
fi

# Step 3: Clean old build
echo -e "${BLUE}[3/5]${NC} Xóa build cũ..."
rm -rf dist/
rm -rf node_modules/.vite/
echo -e "${GREEN}✓ Đã xóa build cũ${NC}"

# Step 4: Build new version
echo -e "${BLUE}[4/5]${NC} Build phiên bản mới..."
npm run build:vps
echo -e "${GREEN}✓ Build thành công${NC}"

# Step 5: Deploy to web root
if [ -d "/var/www/tts-app" ]; then
    echo -e "${BLUE}[5/5]${NC} Deploy lên web server..."

    # Backup old version
    if [ -d "/var/www/tts-app-backup" ]; then
        rm -rf /var/www/tts-app-backup
    fi
    cp -r /var/www/tts-app /var/www/tts-app-backup

    # Copy new build
    sudo cp -r dist/* /var/www/tts-app/
    sudo chown -R www-data:www-data /var/www/tts-app

    # Reload nginx
    sudo systemctl reload nginx

    echo -e "${GREEN}✓ Deploy thành công${NC}"
    echo ""
    echo -e "${YELLOW}💾 Backup cũ: /var/www/tts-app-backup${NC}"
else
    echo -e "${BLUE}[5/5]${NC} Không tìm thấy /var/www/tts-app"
    echo -e "${YELLOW}⚠️  Chưa deploy lên web server${NC}"
    echo ""
    echo "Để deploy thủ công:"
    echo "  sudo mkdir -p /var/www/tts-app"
    echo "  sudo cp -r dist/* /var/www/tts-app/"
fi

# Show info
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 CẬP NHẬT THÀNH CÔNG! 🎉           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""

if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo -e "${YELLOW}📦 Build size: $DIST_SIZE${NC}"
fi

echo -e "${YELLOW}🌐 Truy cập: http://$(hostname -I | awk '{print $1}')${NC}"
echo ""
