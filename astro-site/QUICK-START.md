# 🚀 Quick Start Guide

## Bước 1: Cài đặt dependencies

```bash
cd astro-site
pnpm install
```

## Bước 2: Chạy dev server

```bash
pnpm dev
```

Website sẽ chạy tại: `http://localhost:4321`

## Bước 3: Truy cập trên mobile

1. Tìm địa chỉ IP của máy tính:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Hoặc
   ipconfig getifaddr en0
   ```

2. Trên điện thoại, mở browser và vào:
   ```
   http://[IP-ADDRESS]:4321
   ```
   Ví dụ: `http://192.168.1.100:4321`

3. Đảm bảo máy tính và điện thoại cùng WiFi

## 📱 Features cho Mobile

- ✅ Touch-friendly buttons (44px minimum)
- ✅ Responsive navigation
- ✅ Dark mode toggle
- ✅ Smooth scrolling
- ✅ Optimized font sizes
- ✅ Sidebar tự động ẩn trên mobile

## 🎨 UI/UX Features

- **Dark Mode**: Click icon mặt trăng/ mặt trời ở navbar
- **Navigation**: 
  - Desktop: Sidebar bên trái
  - Mobile: Menu hamburger ở navbar
- **Search**: (Coming soon)
- **Bookmarks**: (Coming soon)

## 📚 Cấu trúc nội dung

- `/` - Trang chủ
- `/interview-prep` - Tài liệu phỏng vấn
  - `/interview-prep/quick-reference/phong-van-nhanh` - Tóm tắt nhanh
  - `/interview-prep/detailed-questions/...` - Câu hỏi chi tiết
- `/javascript-fundamentals` - JavaScript basics

## 🔧 Troubleshooting

### Lỗi không load được markdown files

Đảm bảo các file markdown ở đúng vị trí:
- `../interview-prep/` 
- `../javascript-fundamentals/`

### Mermaid diagrams không hiển thị

- Kiểm tra console browser có lỗi không
- Đảm bảo có internet (Mermaid load từ CDN)
- Thử refresh lại trang

### Dark mode không hoạt động

- Clear browser cache
- Kiểm tra localStorage có bị block không

## 💡 Tips

1. **PWA**: Có thể install như app trên mobile (coming soon)
2. **Offline**: Có thể cache để đọc offline (coming soon)
3. **Search**: Đang phát triển tính năng search

---

**Chúc bạn học tốt! 📚**

