# 🚀 Bắt Đầu Nhanh

## ✅ Đã Fix Lỗi

- ✅ Downgrade Tailwind CSS từ v4 → v3.4.19 (tương thích với @astrojs/tailwind)
- ✅ Cấu hình dark mode
- ✅ Setup Mermaid diagrams

## 🏃 Chạy Website

```bash
cd astro-site
pnpm dev --host
```

Website sẽ chạy tại:
- **Local**: `http://localhost:4321`
- **Network**: `http://[YOUR-IP]:4321`

### Tìm IP Address:

```bash
# Mac
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

## 📱 Truy Cập Trên Mobile

1. Đảm bảo máy tính và điện thoại **cùng WiFi**
2. Tìm IP của máy tính (dùng lệnh trên)
3. Mở browser trên điện thoại và vào: `http://[IP]:4321`
4. Ví dụ: `http://192.168.1.100:4321`

## 🎨 Tính Năng

- ✅ **Full Responsive** - Tối ưu cho mobile
- ✅ **Dark Mode** - Toggle ở navbar
- ✅ **Mermaid Diagrams** - Tự động render
- ✅ **Touch-Friendly** - Buttons 44px minimum
- ✅ **Smooth Scrolling** - Navigation mượt mà

## 📚 Cấu Trúc

- `/` - Trang chủ
- `/interview-prep` - Tài liệu phỏng vấn
- `/javascript-fundamentals` - JavaScript basics

## 🔧 Troubleshooting

### Lỗi "Cannot find module"
```bash
pnpm install
```

### Port đã được sử dụng
```bash
# Kill process trên port 4321
lsof -ti:4321 | xargs kill -9
```

### Không load được trên mobile
- Kiểm tra firewall settings
- Đảm bảo dùng `--host` flag
- Kiểm tra cùng WiFi network

---

**Chúc bạn học tốt! 📚**

