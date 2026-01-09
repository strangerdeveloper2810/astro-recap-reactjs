# HTML Interview Questions / Câu hỏi phỏng vấn HTML

---

## 1. What is the DOCTYPE declaration? / DOCTYPE là gì?

**EN:** DOCTYPE tells the browser which version of HTML the page is using. `<!DOCTYPE html>` declares HTML5.

**VI:** DOCTYPE cho trình duyệt biết trang đang dùng phiên bản HTML nào. `<!DOCTYPE html>` khai báo HTML5.

---

## 2. What is semantic HTML? / HTML ngữ nghĩa là gì?

**EN:** Semantic HTML uses meaningful tags (`<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`) that describe content purpose, improving accessibility and SEO.

**VI:** HTML ngữ nghĩa dùng các thẻ có ý nghĩa (`<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`) mô tả mục đích nội dung, cải thiện accessibility và SEO.

---

## 3. Difference between `<div>` and `<span>`? / Khác biệt giữa `<div>` và `<span>`?

**EN:** `<div>` is block-level (takes full width), `<span>` is inline (takes content width only).

**VI:** `<div>` là block-level (chiếm toàn bộ chiều rộng), `<span>` là inline (chỉ chiếm chiều rộng nội dung).

---

## 4. What are data attributes? / Data attributes là gì?

**EN:** Custom attributes prefixed with `data-` to store extra information. Access via `element.dataset.name` in JS.

```html
<div data-user-id="123" data-role="admin">User</div>
```

**VI:** Thuộc tính tùy chỉnh có tiền tố `data-` để lưu thông tin bổ sung. Truy cập qua `element.dataset.name` trong JS.

---

## 5. Difference between `id` and `class`? / Khác biệt giữa `id` và `class`?

**EN:** `id` must be unique per page, `class` can be reused. `id` has higher CSS specificity.

**VI:** `id` phải duy nhất trong trang, `class` có thể tái sử dụng. `id` có độ ưu tiên CSS cao hơn.

---

## 6. What is the `<meta>` viewport tag? / Thẻ `<meta>` viewport là gì?

**EN:** Controls page dimensions and scaling on mobile devices.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**VI:** Điều khiển kích thước và tỷ lệ trang trên thiết bị di động.

---

## 7. Difference between `<script>`, `<script async>`, `<script defer>`?

**EN:**
- Default: Blocks HTML parsing
- `async`: Downloads parallel, executes immediately when ready
- `defer`: Downloads parallel, executes after HTML parsing complete

**VI:**
- Mặc định: Chặn việc parse HTML
- `async`: Tải song song, thực thi ngay khi sẵn sàng
- `defer`: Tải song song, thực thi sau khi parse HTML xong

---

## 8. What are void/self-closing elements? / Thẻ tự đóng là gì?

**EN:** Elements without closing tags: `<br>`, `<hr>`, `<img>`, `<input>`, `<meta>`, `<link>`.

**VI:** Các thẻ không có thẻ đóng: `<br>`, `<hr>`, `<img>`, `<input>`, `<meta>`, `<link>`.

---

## 9. What is the `alt` attribute in `<img>`? / Thuộc tính `alt` trong `<img>` là gì?

**EN:** Alternative text displayed when image fails to load. Essential for accessibility (screen readers).

**VI:** Văn bản thay thế hiển thị khi ảnh không tải được. Quan trọng cho accessibility (trình đọc màn hình).

---

## 10. Difference between `<strong>` and `<b>`, `<em>` and `<i>`?

**EN:** `<strong>`/`<em>` have semantic meaning (importance/emphasis). `<b>`/`<i>` are purely visual styling.

**VI:** `<strong>`/`<em>` có ý nghĩa ngữ nghĩa (quan trọng/nhấn mạnh). `<b>`/`<i>` chỉ là định dạng hiển thị.

---

## 11. What is an iframe? / iframe là gì?

**EN:** Embeds another HTML document within current page. Used for videos, maps, external content.

```html
<iframe src="https://example.com" width="600" height="400"></iframe>
```

**VI:** Nhúng tài liệu HTML khác vào trang hiện tại. Dùng cho video, bản đồ, nội dung bên ngoài.

---

## 12. What are HTML entities? / HTML entities là gì?

**EN:** Special characters represented by codes: `&lt;` (<), `&gt;` (>), `&amp;` (&), `&nbsp;` (non-breaking space).

**VI:** Ký tự đặc biệt được biểu diễn bằng mã: `&lt;` (<), `&gt;` (>), `&amp;` (&), `&nbsp;` (khoảng trắng không ngắt).

---

## 13. Difference between `<section>` and `<article>`?

**EN:** `<article>` is self-contained, independent content. `<section>` is a thematic grouping of content.

**VI:** `<article>` là nội dung độc lập, tự chứa. `<section>` là nhóm nội dung theo chủ đề.

---

## 14. What is the `<template>` tag? / Thẻ `<template>` là gì?

**EN:** Holds HTML content not rendered on page load, used as template for JavaScript to clone and insert.

**VI:** Chứa nội dung HTML không render khi tải trang, dùng làm mẫu cho JavaScript clone và chèn vào.

---

## 15. What are `<picture>` and `<source>` tags? / Thẻ `<picture>` và `<source>` là gì?

**EN:** Provide responsive images with different sources based on screen size or format support.

```html
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Description">
</picture>
```

**VI:** Cung cấp ảnh responsive với các nguồn khác nhau dựa trên kích thước màn hình hoặc định dạng hỗ trợ.

---

## 16. What is the `<details>` and `<summary>` element? / Thẻ `<details>` và `<summary>` là gì?

**EN:** Creates native collapsible content without JavaScript.

```html
<details>
  <summary>Click to expand</summary>
  <p>Hidden content here</p>
</details>
```

**VI:** Tạo nội dung thu gọn native không cần JavaScript.

---

## 17. What is `<datalist>`? / `<datalist>` là gì?

**EN:** Provides autocomplete suggestions for input fields.

```html
<input list="browsers">
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
</datalist>
```

**VI:** Cung cấp gợi ý autocomplete cho input fields.

---

## 18. Difference between `GET` and `POST` form methods?

**EN:** `GET`: Data in URL, cacheable, for retrieving data. `POST`: Data in body, not cacheable, for submitting data.

**VI:** `GET`: Dữ liệu trong URL, có thể cache, dùng để lấy dữ liệu. `POST`: Dữ liệu trong body, không cache, dùng để gửi dữ liệu.

---

## 19. What is the `<output>` element? / Thẻ `<output>` là gì?

**EN:** Represents the result of a calculation or user action in forms.

```html
<form oninput="result.value=parseInt(a.value)+parseInt(b.value)">
  <input type="number" id="a"> + <input type="number" id="b">
  = <output name="result"></output>
</form>
```

**VI:** Đại diện cho kết quả tính toán hoặc hành động của người dùng trong form.

---

## 20. What is the `contenteditable` attribute? / Thuộc tính `contenteditable` là gì?

**EN:** Makes any element editable by user, like a text input.

```html
<div contenteditable="true">Edit me!</div>
```

**VI:** Làm cho bất kỳ element nào có thể chỉnh sửa bởi người dùng, như text input.

---

## 21. What is the `<dialog>` element? / Thẻ `<dialog>` là gì?

**EN:** Native modal/dialog box. Use `.showModal()` and `.close()` methods.

```html
<dialog id="myDialog">
  <p>Dialog content</p>
  <button onclick="this.closest('dialog').close()">Close</button>
</dialog>
```

**VI:** Modal/dialog box native. Dùng phương thức `.showModal()` và `.close()`.

---

## 22. What are ARIA attributes? / ARIA attributes là gì?

**EN:** Accessible Rich Internet Applications attributes improve accessibility for screen readers: `aria-label`, `aria-hidden`, `role`, `aria-describedby`.

**VI:** Thuộc tính Accessible Rich Internet Applications cải thiện accessibility cho trình đọc màn hình: `aria-label`, `aria-hidden`, `role`, `aria-describedby`.

---

## 23. What is the `<progress>` element? / Thẻ `<progress>` là gì?

**EN:** Shows completion progress of a task.

```html
<progress value="70" max="100">70%</progress>
```

**VI:** Hiển thị tiến độ hoàn thành của một tác vụ.

---

## 24. What is the `<meter>` element? / Thẻ `<meter>` là gì?

**EN:** Represents a scalar measurement within a known range (disk usage, ratings).

```html
<meter value="0.7" min="0" max="1" low="0.3" high="0.7" optimum="0.8">70%</meter>
```

**VI:** Đại diện cho phép đo vô hướng trong phạm vi đã biết (dung lượng ổ đĩa, đánh giá).

---

## 25. Difference between `<link>` and `<a>`?

**EN:** `<link>` links external resources (CSS, icons) in `<head>`. `<a>` creates clickable hyperlinks in `<body>`.

**VI:** `<link>` liên kết tài nguyên bên ngoài (CSS, icons) trong `<head>`. `<a>` tạo hyperlink có thể click trong `<body>`.

---

## 26. What is `srcset` attribute? / Thuộc tính `srcset` là gì?

**EN:** Defines multiple image sources for different screen densities/sizes.

```html
<img src="small.jpg"
     srcset="small.jpg 300w, medium.jpg 600w, large.jpg 1200w"
     sizes="(max-width: 600px) 300px, 600px">
```

**VI:** Định nghĩa nhiều nguồn ảnh cho các mật độ/kích thước màn hình khác nhau.

---

## 27. What is the `loading` attribute? / Thuộc tính `loading` là gì?

**EN:** Native lazy loading for images and iframes: `loading="lazy"` or `loading="eager"`.

```html
<img src="image.jpg" loading="lazy" alt="Lazy loaded image">
```

**VI:** Lazy loading native cho ảnh và iframes: `loading="lazy"` hoặc `loading="eager"`.

---

## 28. What is the `<base>` tag? / Thẻ `<base>` là gì?

**EN:** Sets base URL for all relative URLs in the document.

```html
<head>
  <base href="https://example.com/" target="_blank">
</head>
```

**VI:** Đặt URL gốc cho tất cả URL tương đối trong tài liệu.

---

## 29. What is the `<wbr>` element? / Thẻ `<wbr>` là gì?

**EN:** Word Break Opportunity - suggests where browser can break a long word if needed.

```html
<p>This is a verylongwordthatmight<wbr>needtobreak</p>
```

**VI:** Word Break Opportunity - gợi ý nơi trình duyệt có thể ngắt từ dài nếu cần.

---

## 30. What is the `<mark>` element? / Thẻ `<mark>` là gì?

**EN:** Highlights text for reference or notation purposes (like search results).

```html
<p>The <mark>highlighted</mark> text stands out.</p>
```

**VI:** Đánh dấu văn bản cho mục đích tham khảo hoặc ghi chú (như kết quả tìm kiếm).

---

## 31. What is WCAG? / WCAG là gì?

**EN:** Web Content Accessibility Guidelines - international standards for web accessibility. Four principles: Perceivable, Operable, Understandable, Robust (POUR). Levels: A (minimum), AA (recommended), AAA (highest).

**VI:** Web Content Accessibility Guidelines - tiêu chuẩn quốc tế về accessibility. Bốn nguyên tắc: Perceivable, Operable, Understandable, Robust (POUR). Các mức: A (tối thiểu), AA (khuyến nghị), AAA (cao nhất).

---

## 32. How to manage focus for accessibility? / Quản lý focus cho accessibility như thế nào?

**EN:** Use `tabindex` to control focus order. `tabindex="0"` adds to natural tab order, `tabindex="-1"` allows programmatic focus only.

```html
<div tabindex="0">Focusable div</div>
<div tabindex="-1" id="modal">Focus via JS only</div>
<script>document.getElementById('modal').focus();</script>
```

**VI:** Dùng `tabindex` để điều khiển thứ tự focus. `tabindex="0"` thêm vào thứ tự tab tự nhiên, `tabindex="-1"` chỉ cho phép focus bằng JS.

---

## 33. How to implement keyboard navigation? / Triển khai điều hướng bằng bàn phím như thế nào?

**EN:** Ensure all interactive elements are keyboard accessible. Use semantic elements, handle `keydown` events for custom components.

```html
<button onclick="action()">Click or press Enter</button>
<div role="button" tabindex="0"
     onkeydown="if(event.key==='Enter') action()">Custom button</div>
```

**VI:** Đảm bảo tất cả elements tương tác có thể truy cập bằng bàn phím. Dùng semantic elements, xử lý sự kiện `keydown` cho custom components.

---

## 34. What are HTML5 input types? / Các kiểu input HTML5 là gì?

**EN:** Modern input types with built-in validation and mobile-optimized keyboards.

```html
<input type="email" placeholder="email@example.com">
<input type="tel" placeholder="Phone number">
<input type="number" min="0" max="100" step="5">
<input type="date" min="2024-01-01">
<input type="color" value="#ff0000">
<input type="range" min="0" max="100">
```

**VI:** Các kiểu input hiện đại với validation tích hợp và bàn phím tối ưu cho mobile.

---

## 35. What is the `pattern` attribute? / Thuộc tính `pattern` là gì?

**EN:** Regex pattern for input validation. Use with `title` for error message.

```html
<input type="text" pattern="[A-Za-z]{3,}"
       title="At least 3 letters required">
<input type="tel" pattern="[0-9]{10}"
       title="10 digit phone number">
```

**VI:** Pattern regex để validate input. Dùng với `title` để hiển thị thông báo lỗi.

---

## 36. What is the `autocomplete` attribute? / Thuộc tính `autocomplete` là gì?

**EN:** Hints browser for autofill. Improves UX and accessibility.

```html
<input type="text" name="name" autocomplete="name">
<input type="email" autocomplete="email">
<input type="tel" autocomplete="tel">
<input type="text" autocomplete="street-address">
<input type="password" autocomplete="new-password">
```

**VI:** Gợi ý trình duyệt để autofill. Cải thiện UX và accessibility.

---

## 37. What is localStorage? / localStorage là gì?

**EN:** Persistent storage (no expiry) for key-value pairs. ~5MB limit. Same-origin only. Synchronous API.

```html
<script>
localStorage.setItem('user', 'John');
const user = localStorage.getItem('user');
localStorage.removeItem('user');
localStorage.clear();
</script>
```

**VI:** Lưu trữ persistent (không hết hạn) cho các cặp key-value. Giới hạn ~5MB. Chỉ same-origin. API đồng bộ.

---

## 38. What is sessionStorage? / sessionStorage là gì?

**EN:** Similar to localStorage but data clears when tab/window closes. Per-tab isolation.

```html
<script>
sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');
// Cleared when tab closes
</script>
```

**VI:** Tương tự localStorage nhưng dữ liệu xóa khi đóng tab/window. Cô lập theo từng tab.

---

## 39. Difference between localStorage, sessionStorage, and cookies?

**EN:**
| Feature | localStorage | sessionStorage | Cookies |
|---------|-------------|----------------|---------|
| Expiry | Never | Tab close | Custom |
| Size | ~5MB | ~5MB | ~4KB |
| Sent to server | No | No | Yes (every request) |
| Access | JS only | JS only | JS + Server |

**VI:**
| Tính năng | localStorage | sessionStorage | Cookies |
|-----------|-------------|----------------|---------|
| Hết hạn | Không | Khi đóng tab | Tùy chỉnh |
| Dung lượng | ~5MB | ~5MB | ~4KB |
| Gửi lên server | Không | Không | Có (mọi request) |

---

## 40. What is Intersection Observer API? / Intersection Observer API là gì?

**EN:** Observes when elements enter/exit viewport. Used for lazy loading, infinite scroll, animations.

```html
<img data-src="image.jpg" class="lazy">
<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
});
document.querySelectorAll('.lazy').forEach(img => observer.observe(img));
</script>
```

**VI:** Theo dõi khi elements vào/ra khỏi viewport. Dùng cho lazy loading, infinite scroll, animations.

---

## 41. What is ResizeObserver API? / ResizeObserver API là gì?

**EN:** Observes size changes of elements. Better than window resize event for responsive components.

```html
<div id="container">Resize me</div>
<script>
const observer = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    console.log('Size:', entry.contentRect.width, entry.contentRect.height);
  });
});
observer.observe(document.getElementById('container'));
</script>
```

**VI:** Theo dõi thay đổi kích thước của elements. Tốt hơn window resize event cho responsive components.

---

## 42. What is MutationObserver API? / MutationObserver API là gì?

**EN:** Observes DOM changes (attributes, children, text). Replaces deprecated Mutation Events.

```html
<div id="target">Watch me</div>
<script>
const observer = new MutationObserver((mutations) => {
  mutations.forEach(m => console.log('Changed:', m.type));
});
observer.observe(document.getElementById('target'), {
  attributes: true, childList: true, subtree: true
});
</script>
```

**VI:** Theo dõi thay đổi DOM (attributes, children, text). Thay thế Mutation Events đã deprecated.

---

## 43. What is `<link rel="preload">`? / `<link rel="preload">` là gì?

**EN:** Tells browser to download resource early (high priority). Must specify `as` attribute.

```html
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="hero.jpg" as="image">
```

**VI:** Yêu cầu trình duyệt tải resource sớm (ưu tiên cao). Phải chỉ định thuộc tính `as`.

---

## 44. What is `<link rel="prefetch">`? / `<link rel="prefetch">` là gì?

**EN:** Low-priority download for resources needed on next navigation. Browser fetches during idle time.

```html
<link rel="prefetch" href="next-page.html">
<link rel="prefetch" href="next-page-styles.css">
```

**VI:** Tải ưu tiên thấp cho resources cần ở trang tiếp theo. Trình duyệt tải khi rảnh.

---

## 45. What are `preconnect` and `dns-prefetch`? / `preconnect` và `dns-prefetch` là gì?

**EN:** Early connection hints for external origins. `preconnect` does DNS + TCP + TLS. `dns-prefetch` does DNS only.

```html
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
```

**VI:** Gợi ý kết nối sớm cho origins bên ngoài. `preconnect` thực hiện DNS + TCP + TLS. `dns-prefetch` chỉ DNS.

---

## 46. What is Content Security Policy (CSP)? / Content Security Policy là gì?

**EN:** HTTP header/meta tag to prevent XSS by whitelisting content sources.

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://trusted.com; style-src 'self' 'unsafe-inline'">
```

**VI:** HTTP header/meta tag để ngăn XSS bằng cách whitelist các nguồn content.

---

## 47. How to prevent XSS in HTML? / Cách ngăn XSS trong HTML?

**EN:** Escape user input, use `textContent` instead of `innerHTML`, implement CSP, avoid `javascript:` URLs.

```html
<!-- Bad: vulnerable to XSS -->
<div id="output"></div>
<script>output.innerHTML = userInput;</script>

<!-- Good: safe -->
<script>output.textContent = userInput;</script>
```

**VI:** Escape input từ user, dùng `textContent` thay vì `innerHTML`, triển khai CSP, tránh `javascript:` URLs.

---

## 48. What is `rel="noopener noreferrer"`? / `rel="noopener noreferrer"` là gì?

**EN:** Security attributes for external links. `noopener` prevents `window.opener` access. `noreferrer` hides referrer header.

```html
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>
```

**VI:** Thuộc tính bảo mật cho links bên ngoài. `noopener` ngăn truy cập `window.opener`. `noreferrer` ẩn referrer header.

---

## 49. What is the `inert` attribute? / Thuộc tính `inert` là gì?

**EN:** Makes element and descendants non-interactive and invisible to assistive technology. Useful for modals.

```html
<main inert>
  <!-- Content behind modal, not focusable -->
</main>
<dialog open>
  <p>Modal content (interactive)</p>
</dialog>
```

**VI:** Làm element và descendants không tương tác được và ẩn với công nghệ hỗ trợ. Hữu ích cho modals.

---

## 50. What is the Popover API? / Popover API là gì?

**EN:** Native popover without JavaScript. Uses `popover` attribute and `popovertarget` for trigger.

```html
<button popovertarget="mypopover">Open Popover</button>
<div id="mypopover" popover>
  <p>Popover content!</p>
</div>

<!-- Manual control -->
<div id="pop" popover="manual">Manual popover</div>
<button popovertarget="pop" popovertargetaction="show">Show</button>
<button popovertarget="pop" popovertargetaction="hide">Hide</button>
```

**VI:** Popover native không cần JavaScript. Dùng thuộc tính `popover` và `popovertarget` để kích hoạt.
