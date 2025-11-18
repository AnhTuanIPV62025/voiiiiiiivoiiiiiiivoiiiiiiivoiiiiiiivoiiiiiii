#!/bin/bash

# ============================================
# Deploy Script cho VPS Ubuntu 22 (1CPU-1GB)
# ============================================

set -e  # Exit on error

echo "🚀 Bắt đầu deploy trên VPS..."

# Màu cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kiểm tra swap (quan trọng cho VPS 1GB RAM)
check_swap() {
    echo -e "${YELLOW}Kiểm tra swap...${NC}"
    SWAP=$(free -m | grep Swap | awk '{print $2}')

    if [ "$SWAP" -eq 0 ]; then
        echo -e "${RED}⚠️  Cảnh báo: Không có swap. Khuyến nghị tạo swap file!${NC}"
        echo "Chạy lệnh sau để tạo 1GB swap:"
        echo "sudo fallocate -l 1G /swapfile"
        echo "sudo chmod 600 /swapfile"
        echo "sudo mkswap /swapfile"
        echo "sudo swapon /swapfile"
        echo ""
        read -p "Tiếp tục build không có swap? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Swap: ${SWAP}MB${NC}"
    fi
}

# Kiểm tra Node.js version
check_node() {
    echo -e "${YELLOW}Kiểm tra Node.js...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js chưa được cài đặt${NC}"
        echo "Cài đặt Node.js 20:"
        echo "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "sudo apt-get install -y nodejs"
        exit 1
    fi

    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
}

# Clean cache và old builds
clean_build() {
    echo -e "${YELLOW}Dọn dẹp build cũ...${NC}"
    rm -rf dist/
    rm -rf node_modules/.vite/
    echo -e "${GREEN}✓ Đã xóa build cũ${NC}"
}

# Cài đặt dependencies
install_deps() {
    echo -e "${YELLOW}Cài đặt dependencies...${NC}"

    if [ ! -d "node_modules" ]; then
        npm ci --production=false
    else
        echo "node_modules đã tồn tại, skip install"
    fi

    echo -e "${GREEN}✓ Dependencies đã sẵn sàng${NC}"
}

# Build với memory limit
build_app() {
    echo -e "${YELLOW}Building ứng dụng (có thể mất 1-2 phút)...${NC}"

    # Sử dụng build:vps script với memory limit
    npm run build:vps

    echo -e "${GREEN}✓ Build thành công!${NC}"
}

# Hiển thị thông tin build
show_info() {
    echo ""
    echo "======================================"
    echo -e "${GREEN}🎉 Build hoàn thành!${NC}"
    echo "======================================"

    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo "📦 Kích thước dist: $DIST_SIZE"
        echo "📁 Thư mục: $(pwd)/dist"
        echo ""
        echo "Files trong dist:"
        ls -lh dist/
        echo ""
        echo "Assets:"
        ls -lh dist/assets/ 2>/dev/null || echo "Không có assets"
    fi

    echo ""
    echo "Để xem preview:"
    echo "  npm run preview"
    echo ""
    echo "Để serve với nginx:"
    echo "  sudo cp -r dist/* /var/www/html/"
}

# Main execution
main() {
    echo "======================================"
    echo "  VPS Deploy Script - Ubuntu 22"
    echo "  Cấu hình: 1 CPU - 1GB RAM"
    echo "======================================"
    echo ""

    check_swap
    check_node
    clean_build
    install_deps
    build_app
    show_info
}

# Run main
main
