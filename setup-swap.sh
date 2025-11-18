#!/bin/bash

# ============================================
# Script tạo Swap cho VPS 1GB RAM
# ============================================

set -e

echo "🔧 Thiết lập Swap cho VPS..."

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Script này cần chạy với quyền root (sudo)"
    exit 1
fi

# Kiểm tra swap hiện tại
CURRENT_SWAP=$(free -m | grep Swap | awk '{print $2}')
echo "Swap hiện tại: ${CURRENT_SWAP}MB"

if [ "$CURRENT_SWAP" -gt 0 ]; then
    echo "⚠️  Swap đã tồn tại. Bạn có muốn tạo swap mới? (y/N)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Tạo 1GB swap file
echo "📝 Tạo swap file 1GB..."
fallocate -l 1G /swapfile

# Set permissions
echo "🔒 Thiết lập quyền..."
chmod 600 /swapfile

# Make swap
echo "⚙️  Format swap..."
mkswap /swapfile

# Enable swap
echo "✅ Kích hoạt swap..."
swapon /swapfile

# Make permanent (add to /etc/fstab)
if ! grep -q "/swapfile" /etc/fstab; then
    echo "💾 Thêm vào /etc/fstab để swap tự động kích hoạt khi reboot..."
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Tối ưu swappiness (khuyến nghị 10 cho VPS)
echo "⚡ Tối ưu swappiness..."
sysctl vm.swappiness=10
if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
    echo "vm.swappiness=10" >> /etc/sysctl.conf
fi

# Verify
echo ""
echo "======================================"
echo "✅ Swap đã được thiết lập thành công!"
echo "======================================"
free -h
echo ""
echo "Swap file: /swapfile"
echo "Swappiness: $(cat /proc/sys/vm/swappiness)"
