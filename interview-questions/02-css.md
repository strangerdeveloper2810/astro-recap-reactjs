# CSS Interview Questions / Câu hỏi phỏng vấn CSS

---

## 1. What is the CSS Box Model? / Box Model trong CSS là gì?

**EN:** The Box Model describes how elements are rendered as boxes with 4 layers: content, padding, border, and margin. By default, `width` only sets the content width. Use `box-sizing: border-box` to include padding and border in the width calculation.

```css
* {
  box-sizing: border-box;
}
.box {
  width: 200px;
  padding: 20px;
  border: 2px solid black;
  margin: 10px;
  /* Total width = 200px (border-box) */
}
```

**VI:** Box Model mô tả cách element được render như các hộp với 4 lớp: content, padding, border, và margin. Mặc định, `width` chỉ áp dụng cho content. Dùng `box-sizing: border-box` để width bao gồm cả padding và border.

---

## 2. What is the difference between margin and padding? / Sự khác nhau giữa margin và padding là gì?

**EN:** Padding is the space inside the element (between content and border), while margin is the space outside the element (between border and other elements). Padding affects the element's background; margin is always transparent.

**VI:** Padding là khoảng trống bên trong element (giữa content và border), còn margin là khoảng trống bên ngoài (giữa border và các element khác). Padding ảnh hưởng background của element; margin luôn trong suốt.

---

## 3. What is the difference between display: block, inline, and inline-block? / Sự khác nhau giữa display: block, inline, và inline-block?

**EN:**
- `block`: Takes full width, starts on new line, respects width/height
- `inline`: Only takes content width, no new line, ignores width/height
- `inline-block`: Inline flow but respects width/height and vertical margin/padding

```css
span { display: inline-block; width: 100px; height: 50px; }
```

**VI:**
- `block`: Chiếm toàn bộ chiều rộng, xuống dòng mới, nhận width/height
- `inline`: Chỉ chiếm chiều rộng content, không xuống dòng, bỏ qua width/height
- `inline-block`: Nằm inline nhưng nhận width/height và margin/padding dọc

---

## 4. What does display: none do and how is it different from visibility: hidden? / display: none làm gì và khác visibility: hidden như thế nào?

**EN:** `display: none` removes the element from the document flow entirely (no space occupied). `visibility: hidden` hides the element but it still takes up space in the layout.

```css
.removed { display: none; }      /* Element gone, no space */
.hidden { visibility: hidden; }  /* Invisible but space remains */
```

**VI:** `display: none` loại bỏ element hoàn toàn khỏi document flow (không chiếm không gian). `visibility: hidden` ẩn element nhưng vẫn giữ nguyên vị trí trong layout.

---

## 5. What is margin collapse? / Margin collapse là gì?

**EN:** When vertical margins of adjacent block elements meet, they collapse into a single margin equal to the larger of the two (not the sum). This only happens with vertical margins, not horizontal.

```css
.box1 { margin-bottom: 20px; }
.box2 { margin-top: 30px; }
/* Actual gap = 30px, not 50px */
```

**VI:** Khi margin dọc của các block element liền kề gặp nhau, chúng gộp lại thành một margin bằng giá trị lớn hơn (không phải tổng). Điều này chỉ xảy ra với margin dọc, không xảy ra với margin ngang.

---

## 6. What is Flexbox and when should you use it? / Flexbox là gì và khi nào nên dùng?

**EN:** Flexbox is a one-dimensional layout system for arranging items in a row or column. Use it for navigation bars, centering content, distributing space between items, or aligning items within a container.

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**VI:** Flexbox là hệ thống layout một chiều để sắp xếp items theo hàng hoặc cột. Dùng cho navigation bars, căn giữa nội dung, phân phối khoảng trống giữa items, hoặc căn chỉnh items trong container.

---

## 7. Explain justify-content and align-items in Flexbox. / Giải thích justify-content và align-items trong Flexbox.

**EN:**
- `justify-content`: Aligns items along the main axis (horizontal in row, vertical in column)
- `align-items`: Aligns items along the cross axis (vertical in row, horizontal in column)

```css
.flex-container {
  display: flex;
  justify-content: space-between; /* flex-start | center | space-around | space-evenly */
  align-items: center;            /* flex-start | flex-end | stretch | baseline */
}
```

**VI:**
- `justify-content`: Căn chỉnh items theo trục chính (ngang nếu row, dọc nếu column)
- `align-items`: Căn chỉnh items theo trục phụ (dọc nếu row, ngang nếu column)

---

## 8. What is the difference between flex-grow, flex-shrink, and flex-basis? / Sự khác nhau giữa flex-grow, flex-shrink, và flex-basis?

**EN:**
- `flex-grow`: How much item grows relative to others when extra space exists
- `flex-shrink`: How much item shrinks relative to others when space is tight
- `flex-basis`: Initial size before growing/shrinking (like width for row direction)

```css
.item { flex: 1 0 200px; } /* grow: 1, shrink: 0, basis: 200px */
```

**VI:**
- `flex-grow`: Mức độ item phát triển so với các item khác khi có khoảng trống
- `flex-shrink`: Mức độ item co lại so với các item khác khi thiếu chỗ
- `flex-basis`: Kích thước ban đầu trước khi grow/shrink (như width cho row)

---

## 9. What does flex: 1 mean? / flex: 1 có nghĩa là gì?

**EN:** `flex: 1` is shorthand for `flex-grow: 1`, `flex-shrink: 1`, `flex-basis: 0`. It means the item will grow to fill available space equally with other `flex: 1` items.

```css
.item { flex: 1; }     /* Same as: flex: 1 1 0 */
.item { flex: auto; }  /* Same as: flex: 1 1 auto */
```

**VI:** `flex: 1` là shorthand cho `flex-grow: 1`, `flex-shrink: 1`, `flex-basis: 0`. Nghĩa là item sẽ phát triển để lấp đầy khoảng trống, chia đều với các item `flex: 1` khác.

---

## 10. How do you center an element both horizontally and vertically with Flexbox? / Làm sao căn giữa element theo cả chiều ngang và dọc với Flexbox?

**EN:**
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

Or use `place-items: center` (shorthand for align-items + justify-items in grid-like behavior).

**VI:**
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

Hoặc dùng `place-items: center` (shorthand cho align-items + justify-items).

---

## 11. What is CSS Grid and how is it different from Flexbox? / CSS Grid là gì và khác Flexbox như thế nào?

**EN:** CSS Grid is a two-dimensional layout system (rows AND columns simultaneously). Flexbox is one-dimensional (row OR column). Use Grid for page layouts; use Flexbox for component-level alignment.

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
}
```

**VI:** CSS Grid là hệ thống layout hai chiều (hàng VÀ cột cùng lúc). Flexbox là một chiều (hàng HOẶC cột). Dùng Grid cho page layouts; dùng Flexbox cho căn chỉnh component.

---

## 12. What is the fr unit in CSS Grid? / Đơn vị fr trong CSS Grid là gì?

**EN:** `fr` (fraction) represents a fraction of the available space in the grid container. It distributes space proportionally.

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 25% - 50% - 25% of available space */
}
```

**VI:** `fr` (fraction) đại diện cho một phần của không gian có sẵn trong grid container. Nó phân phối không gian theo tỷ lệ.

---

## 13. What is gap in CSS Grid/Flexbox? / Gap trong CSS Grid/Flexbox là gì?

**EN:** `gap` sets the spacing between grid/flex items (not around them). It replaced the older `grid-gap`. Works with both Grid and Flexbox.

```css
.container {
  display: grid;
  gap: 20px;           /* Both row and column gap */
  gap: 10px 20px;      /* row-gap column-gap */
}
```

**VI:** `gap` đặt khoảng cách giữa các grid/flex items (không phải xung quanh). Nó thay thế `grid-gap` cũ. Hoạt động với cả Grid và Flexbox.

---

## 14. What is the difference between auto-fit and auto-fill in CSS Grid? / Sự khác nhau giữa auto-fit và auto-fill trong CSS Grid?

**EN:**
- `auto-fill`: Creates as many tracks as possible, even empty ones
- `auto-fit`: Creates tracks but collapses empty ones, allowing items to stretch

```css
/* auto-fit stretches items when space is available */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

/* auto-fill keeps empty track spaces */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
```

**VI:**
- `auto-fill`: Tạo nhiều track nhất có thể, kể cả track rỗng
- `auto-fit`: Tạo tracks nhưng thu gọn track rỗng, cho phép items giãn ra

---

## 15. How do you create a responsive grid without media queries? / Làm sao tạo grid responsive mà không dùng media queries?

**EN:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

This creates a responsive grid where items are at least 250px wide and automatically wrap to new rows.

**VI:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

Tạo grid responsive với items ít nhất 250px và tự động xuống hàng mới.

---

## 16. Explain the different position values in CSS. / Giải thích các giá trị position trong CSS.

**EN:**
- `static`: Default, normal document flow
- `relative`: Positioned relative to its normal position
- `absolute`: Positioned relative to nearest positioned ancestor
- `fixed`: Positioned relative to viewport, stays on scroll
- `sticky`: Hybrid of relative and fixed, sticks at threshold

**VI:**
- `static`: Mặc định, theo document flow bình thường
- `relative`: Định vị so với vị trí bình thường của nó
- `absolute`: Định vị so với ancestor có position gần nhất
- `fixed`: Định vị so với viewport, cố định khi scroll
- `sticky`: Kết hợp relative và fixed, dính tại ngưỡng nhất định

---

## 17. What is the difference between position: absolute and position: fixed? / Sự khác nhau giữa position: absolute và position: fixed?

**EN:** `absolute` positions relative to the nearest positioned ancestor (or document if none). `fixed` always positions relative to the viewport and doesn't move when scrolling.

```css
.modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.tooltip { position: absolute; top: 100%; left: 0; }
```

**VI:** `absolute` định vị so với ancestor có position gần nhất (hoặc document nếu không có). `fixed` luôn định vị so với viewport và không di chuyển khi scroll.

---

## 18. How does position: sticky work? / position: sticky hoạt động như thế nào?

**EN:** `sticky` acts like `relative` until the element reaches a specified scroll threshold (top, bottom, etc.), then it "sticks" like `fixed`. It stays within its parent container.

```css
.header {
  position: sticky;
  top: 0; /* Sticks when scrolled to top */
}
```

**VI:** `sticky` hoạt động như `relative` cho đến khi element đạt ngưỡng scroll được chỉ định, sau đó nó "dính" như `fixed`. Nó chỉ dính trong phạm vi parent container.

---

## 19. What is CSS specificity? / Specificity trong CSS là gì?

**EN:** Specificity determines which CSS rule applies when multiple rules target the same element. It's calculated as (inline, IDs, classes, elements):

- Inline styles: 1,0,0,0
- IDs (#id): 0,1,0,0
- Classes, attributes, pseudo-classes: 0,0,1,0
- Elements, pseudo-elements: 0,0,0,1

```css
#nav .item { }     /* 0,1,1,0 */
.nav .item.active { } /* 0,0,3,0 - lower than above */
```

**VI:** Specificity xác định rule CSS nào được áp dụng khi nhiều rules nhắm vào cùng element. Tính theo (inline, IDs, classes, elements). ID selector mạnh hơn class selector.

---

## 20. What is the CSS cascade? / CSS cascade là gì?

**EN:** The cascade is the algorithm that determines which styles apply. Priority order:
1. Importance (!important)
2. Origin (author > user > browser)
3. Specificity
4. Source order (later rules win)

```css
p { color: blue; }
p { color: red; } /* This wins - same specificity, later in source */
```

**VI:** Cascade là thuật toán xác định styles nào được áp dụng. Thứ tự ưu tiên: !important > origin > specificity > thứ tự code (rule sau thắng nếu cùng specificity).

---

## 21. What is CSS inheritance? / Kế thừa trong CSS là gì?

**EN:** Some CSS properties are inherited from parent to child elements by default (color, font-family, line-height). Others are not (margin, padding, border). Use `inherit` to force inheritance.

```css
.parent { color: blue; }
.child { color: inherit; } /* Explicitly inherit */
.child { all: inherit; }   /* Inherit all properties */
```

**VI:** Một số thuộc tính CSS được kế thừa từ cha sang con mặc định (color, font-family, line-height). Các thuộc tính khác thì không (margin, padding, border). Dùng `inherit` để ép kế thừa.

---

## 22. What is the difference between pseudo-classes and pseudo-elements? / Sự khác nhau giữa pseudo-classes và pseudo-elements?

**EN:**
- Pseudo-classes (`:`) select elements in a specific state: `:hover`, `:focus`, `:nth-child()`
- Pseudo-elements (`::`) create/style parts of elements: `::before`, `::after`, `::first-line`

```css
a:hover { color: red; }           /* Pseudo-class */
p::first-letter { font-size: 2em; } /* Pseudo-element */
```

**VI:**
- Pseudo-classes (`:`) chọn elements ở trạng thái cụ thể: `:hover`, `:focus`, `:nth-child()`
- Pseudo-elements (`::`) tạo/style các phần của elements: `::before`, `::after`, `::first-line`

---

## 23. How do ::before and ::after pseudo-elements work? / ::before và ::after hoạt động như thế nào?

**EN:** They create virtual elements as first/last child of the selected element. Requires `content` property (can be empty string). Used for decorations, icons, clearfixes.

```css
.quote::before {
  content: '"';
  color: gray;
}
.required::after {
  content: '*';
  color: red;
}
```

**VI:** Chúng tạo elements ảo làm child đầu/cuối của element được chọn. Cần thuộc tính `content` (có thể là chuỗi rỗng). Dùng cho trang trí, icons, clearfixes.

---

## 24. How does :nth-child() selector work? / Selector :nth-child() hoạt động như thế nào?

**EN:** Selects elements based on their position among siblings. Accepts numbers, keywords, or formulas.

```css
li:nth-child(1) { }      /* First child */
li:nth-child(odd) { }    /* 1st, 3rd, 5th... */
li:nth-child(even) { }   /* 2nd, 4th, 6th... */
li:nth-child(3n) { }     /* Every 3rd: 3, 6, 9... */
li:nth-child(3n+1) { }   /* 1, 4, 7, 10... */
```

**VI:** Chọn elements dựa trên vị trí của chúng trong các siblings. Nhận số, keywords, hoặc công thức như `2n+1` (lẻ), `2n` (chẵn), `3n` (mỗi 3 phần tử).

---

## 25. What are media queries and how do they work? / Media queries là gì và hoạt động như thế nào?

**EN:** Media queries apply CSS conditionally based on device characteristics (width, height, orientation). Essential for responsive design.

```css
/* Mobile first approach */
.container { width: 100%; }

@media (min-width: 768px) {
  .container { width: 750px; }
}

@media (min-width: 1024px) {
  .container { width: 960px; }
}
```

**VI:** Media queries áp dụng CSS có điều kiện dựa trên đặc điểm thiết bị (width, height, orientation). Thiết yếu cho responsive design.

---

## 26. What is mobile-first design in CSS? / Mobile-first design trong CSS là gì?

**EN:** Mobile-first means writing base styles for mobile, then using `min-width` media queries to add styles for larger screens. Better performance on mobile and easier to scale up.

```css
/* Base styles (mobile) */
.nav { flex-direction: column; }

/* Tablet and up */
@media (min-width: 768px) {
  .nav { flex-direction: row; }
}
```

**VI:** Mobile-first nghĩa là viết styles cơ bản cho mobile, sau đó dùng `min-width` media queries để thêm styles cho màn hình lớn hơn. Hiệu suất tốt hơn trên mobile và dễ mở rộng.

---

## 27. What is the difference between rem, em, and px? / Sự khác nhau giữa rem, em, và px?

**EN:**
- `px`: Absolute unit, fixed size
- `em`: Relative to parent's font-size
- `rem`: Relative to root (html) font-size

```css
html { font-size: 16px; }
.parent { font-size: 20px; }
.child {
  font-size: 1.5em;   /* 30px (20 * 1.5) */
  padding: 1.5rem;    /* 24px (16 * 1.5) */
}
```

**VI:**
- `px`: Đơn vị tuyệt đối, kích thước cố định
- `em`: Tương đối với font-size của parent
- `rem`: Tương đối với font-size của root (html)

---

## 28. What are CSS custom properties (variables)? / CSS custom properties (variables) là gì?

**EN:** CSS variables store reusable values. Defined with `--name`, accessed with `var()`. They cascade and can be overridden in nested scopes.

```css
:root {
  --primary-color: #3498db;
  --spacing: 1rem;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}

.dark-theme {
  --primary-color: #2980b9; /* Override in scope */
}
```

**VI:** CSS variables lưu trữ giá trị có thể tái sử dụng. Định nghĩa với `--name`, truy cập với `var()`. Chúng cascade và có thể override trong phạm vi con.

---

## 29. What is clamp() in CSS and when would you use it? / clamp() trong CSS là gì và khi nào nên dùng?

**EN:** `clamp(min, preferred, max)` sets a value that adapts between a minimum and maximum. Perfect for fluid typography and responsive sizing without media queries.

```css
/* Fluid font: min 1rem, max 2rem, scales with viewport */
h1 {
  font-size: clamp(1rem, 2vw + 1rem, 2rem);
}

/* Responsive width */
.container {
  width: clamp(300px, 80%, 1200px);
}
```

**VI:** `clamp(min, preferred, max)` đặt giá trị tự điều chỉnh giữa min và max. Hoàn hảo cho fluid typography và responsive sizing mà không cần media queries.

---

## 30. What are container queries in CSS? / Container queries trong CSS là gì?

**EN:** Container queries style elements based on their container's size (not viewport). Useful for reusable components that adapt to their context.

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}

@container card (max-width: 399px) {
  .card {
    flex-direction: column;
  }
}
```

**VI:** Container queries style elements dựa trên kích thước container (không phải viewport). Hữu ích cho components tái sử dụng cần thích ứng với ngữ cảnh chứa nó.

---

## 31. What are CSS keyframes and how do animations work? / CSS keyframes là gì và animations hoạt động như thế nào?

**EN:** `@keyframes` defines animation stages. Use `animation` property to apply it with duration, timing, iteration, etc.

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Or with percentages */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.element {
  animation: fadeIn 0.3s ease-out forwards;
}
```

**VI:** `@keyframes` định nghĩa các giai đoạn animation. Dùng thuộc tính `animation` để áp dụng với duration, timing, iteration, v.v.

---

## 32. What animation properties are available in CSS? / Những thuộc tính animation nào có trong CSS?

**EN:** Key animation properties:
- `animation-name`: keyframe name
- `animation-duration`: how long
- `animation-timing-function`: ease, linear, cubic-bezier
- `animation-delay`: wait before start
- `animation-iteration-count`: number or infinite
- `animation-direction`: normal, reverse, alternate
- `animation-fill-mode`: none, forwards, backwards, both

```css
.box {
  animation: slide 2s ease-in-out 0.5s infinite alternate forwards;
}
```

**VI:** Các thuộc tính animation chính: name, duration, timing-function, delay, iteration-count, direction, fill-mode. Có thể viết shorthand trong một dòng.

---

## 33. Why should you use transform instead of top/left for animations? / Tại sao nên dùng transform thay vì top/left cho animations?

**EN:** `transform` and `opacity` are GPU-accelerated and only trigger compositing (cheapest). Animating `top/left` triggers layout recalculation (expensive), causing jank.

```css
/* Bad - triggers layout */
.box {
  animation: moveLeft 0.3s;
}
@keyframes moveLeft {
  to { left: 100px; }
}

/* Good - GPU accelerated */
.box {
  animation: moveLeft 0.3s;
}
@keyframes moveLeft {
  to { transform: translateX(100px); }
}
```

**VI:** `transform` và `opacity` được GPU tăng tốc, chỉ trigger compositing (rẻ nhất). Animate `top/left` trigger layout recalculation (tốn kém), gây giật lag.

---

## 34. How does z-index work in CSS? / z-index hoạt động như thế nào trong CSS?

**EN:** `z-index` controls stacking order of positioned elements (not static). Higher values appear on top. Only works within the same stacking context.

```css
.behind { position: relative; z-index: 1; }
.infront { position: relative; z-index: 2; }

/* z-index: auto doesn't create stacking context */
/* z-index with integer value creates one */
```

**VI:** `z-index` điều khiển thứ tự xếp chồng của positioned elements (không phải static). Giá trị cao hơn nằm trên. Chỉ hoạt động trong cùng stacking context.

---

## 35. What creates a new stacking context? / Điều gì tạo stacking context mới?

**EN:** A new stacking context is created by:
- Root element (html)
- `position: absolute/relative` with `z-index` (not auto)
- `position: fixed/sticky`
- `opacity` less than 1
- `transform`, `filter`, `perspective`
- `isolation: isolate`

```css
/* Creates stacking context */
.parent {
  position: relative;
  z-index: 0; /* or any integer */
}

.isolated {
  isolation: isolate; /* Explicit way */
}
```

**VI:** Stacking context mới được tạo bởi: root element, position với z-index, fixed/sticky, opacity < 1, transform, filter, perspective, hoặc `isolation: isolate`.

---

## 36. Why doesn't my z-index work? / Tại sao z-index của tôi không hoạt động?

**EN:** Common z-index issues:
1. Element is `position: static` (default)
2. Parent has lower stacking context than sibling's parent
3. Comparing elements in different stacking contexts

```css
/* Problem: Parent limits child's z-index */
.parent-a { position: relative; z-index: 1; }
.parent-b { position: relative; z-index: 2; }
.child-a { z-index: 9999; } /* Still behind parent-b! */

/* Solution: Raise parent's z-index or use isolation */
```

**VI:** Lý do z-index không hoạt động: element là static, parent có stacking context thấp hơn parent của sibling, hoặc so sánh elements trong các stacking context khác nhau.

---

## 37. What is BEM methodology? / BEM methodology là gì?

**EN:** BEM (Block Element Modifier) is a naming convention for CSS classes. It creates clear, modular, reusable components.

```css
/* Block: standalone component */
.card { }

/* Element: part of block (double underscore) */
.card__title { }
.card__image { }
.card__content { }

/* Modifier: variation/state (double dash) */
.card--featured { }
.card__title--large { }
```

```html
<div class="card card--featured">
  <h2 class="card__title card__title--large">Title</h2>
</div>
```

**VI:** BEM (Block Element Modifier) là quy ước đặt tên CSS classes. Block là component độc lập, Element là phần của block (dùng __), Modifier là biến thể/trạng thái (dùng --).

---

## 38. What are the benefits of CSS architecture patterns like BEM? / Lợi ích của CSS architecture patterns như BEM là gì?

**EN:** Benefits:
- **Predictable**: Class names describe purpose and relationship
- **Reusable**: Components are self-contained
- **No specificity wars**: Flat specificity (single class)
- **Scalable**: Easy to maintain in large projects
- **Self-documenting**: HTML structure is clear

```css
/* Without BEM - unclear relationships */
.header .nav .item.active { }

/* With BEM - clear and flat */
.header__nav-item--active { }
```

**VI:** Lợi ích: dự đoán được (tên class mô tả mục đích), tái sử dụng được, không đấu specificity, dễ scale, tự document. Class names phẳng, không lồng nhau.

---

## 39. What CSS naming conventions exist besides BEM? / Có những naming conventions CSS nào ngoài BEM?

**EN:**
- **OOCSS**: Separate structure from skin, container from content
- **SMACSS**: Base, Layout, Module, State, Theme categories
- **ITCSS**: Inverted triangle - settings, tools, generic, elements, objects, components, utilities
- **Atomic CSS/Utility-first**: Single-purpose classes (like Tailwind)

```css
/* OOCSS */
.btn { } .btn-primary { }

/* Atomic/Utility */
.flex .justify-center .p-4 .bg-blue-500
```

**VI:** Các conventions khác: OOCSS (tách structure/skin), SMACSS (phân loại theo layers), ITCSS (tam giác ngược), Atomic CSS (class đơn mục đích như Tailwind).

---

## 40. How does calc() work in CSS? / calc() hoạt động như thế nào trong CSS?

**EN:** `calc()` performs math with mixed units. Useful for combining fixed and relative values.

```css
.sidebar {
  width: calc(100% - 250px); /* Full width minus fixed sidebar */
}

.element {
  padding: calc(1rem + 5px);
  width: calc(100vw / 3 - 2rem);
  font-size: calc(14px + 0.5vw);
}

/* Can nest calc */
width: calc(calc(100% - 20px) / 2);
```

**VI:** `calc()` thực hiện phép toán với các đơn vị khác nhau. Hữu ích để kết hợp giá trị cố định và tương đối. Có thể lồng calc trong calc.

---

## 41. What are min() and max() functions in CSS? / Hàm min() và max() trong CSS là gì?

**EN:** `min()` returns the smallest value; `max()` returns the largest. Useful for responsive constraints.

```css
/* Width is 50% but never more than 500px */
.container {
  width: min(50%, 500px);
}

/* Width is 300px but never less than 50% */
.sidebar {
  width: max(300px, 50%);
}

/* Combine for responsive padding */
.section {
  padding: max(2rem, 5vw);
}
```

**VI:** `min()` trả về giá trị nhỏ nhất; `max()` trả về giá trị lớn nhất. Hữu ích cho responsive constraints mà không cần media queries.

---

## 42. What is minmax() in CSS Grid? / minmax() trong CSS Grid là gì?

**EN:** `minmax(min, max)` defines a size range for grid tracks. The track will be at least `min` but won't exceed `max`.

```css
.grid {
  display: grid;
  /* Columns: minimum 200px, maximum 1fr */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

  /* Rows: minimum content height, maximum 300px */
  grid-template-rows: minmax(100px, auto);
}

/* Common responsive pattern */
grid-template-columns: minmax(0, 1fr); /* Prevents overflow */
```

**VI:** `minmax(min, max)` định nghĩa phạm vi kích thước cho grid tracks. Track sẽ ít nhất là `min` nhưng không vượt quá `max`. Thường dùng với repeat() cho responsive grids.

---

## 43. How do :is() and :where() selectors work? / Selectors :is() và :where() hoạt động như thế nào?

**EN:** Both accept selector lists to reduce repetition. Difference: `:is()` takes specificity of most specific argument; `:where()` has zero specificity.

```css
/* Without :is() - repetitive */
header a, nav a, footer a { color: blue; }

/* With :is() - cleaner */
:is(header, nav, footer) a { color: blue; }

/* :where() - zero specificity, easy to override */
:where(header, nav, footer) a { color: blue; }

/* :is() takes highest specificity */
:is(.class, #id) span { } /* Specificity of #id */
```

**VI:** Cả hai nhận danh sách selectors để giảm lặp lại. Khác biệt: `:is()` lấy specificity của argument cao nhất; `:where()` có specificity bằng 0, dễ override.

---

## 44. What is the :has() selector and how is it used? / Selector :has() là gì và dùng như thế nào?

**EN:** `:has()` is the "parent selector" - selects elements that contain certain descendants. It's powerful for styling based on content.

```css
/* Card that has an image */
.card:has(img) {
  grid-template-rows: auto 1fr;
}

/* Form group with invalid input */
.form-group:has(input:invalid) {
  border-color: red;
}

/* Parent of hovered element */
li:has(> a:hover) {
  background: lightblue;
}

/* Figure with figcaption */
figure:has(figcaption) img {
  border-radius: 8px 8px 0 0;
}
```

**VI:** `:has()` là "parent selector" - chọn elements chứa descendants nhất định. Mạnh mẽ để style dựa trên nội dung bên trong, như style parent khi child ở trạng thái nào đó.

---

## 45. How does :not() selector work? / Selector :not() hoạt động như thế nào?

**EN:** `:not()` excludes elements matching the argument. Modern CSS allows complex selectors inside.

```css
/* All paragraphs except .intro */
p:not(.intro) { text-indent: 1em; }

/* Links except those with class */
a:not([class]) { color: blue; }

/* Multiple exclusions */
input:not([type="submit"]):not([type="button"]) {
  border: 1px solid gray;
}

/* Modern: complex selectors */
li:not(:first-child):not(:last-child) { }
/* Or cleaner with :is() */
li:not(:is(:first-child, :last-child)) { }
```

**VI:** `:not()` loại trừ elements khớp với argument. CSS hiện đại cho phép selectors phức tạp bên trong. Có thể kết hợp nhiều :not() hoặc dùng với :is().

---

## 46. How do you create print styles in CSS? / Làm sao tạo print styles trong CSS?

**EN:** Use `@media print` to style for printing. Hide navigation, adjust colors, handle page breaks.

```css
@media print {
  /* Hide non-essential elements */
  nav, .sidebar, .ads, button { display: none; }

  /* Adjust colors for printing */
  body { color: black; background: white; }

  /* Show URLs after links */
  a[href]::after { content: " (" attr(href) ")"; }

  /* Control page breaks */
  h2, h3 { page-break-after: avoid; }
  table, figure { page-break-inside: avoid; }

  /* Set page margins */
  @page { margin: 2cm; }
}
```

**VI:** Dùng `@media print` để style cho in ấn. Ẩn navigation, điều chỉnh màu sắc, xử lý page breaks. Dùng `@page` để set margins cho trang in.

---

## 47. How do you implement dark mode with prefers-color-scheme? / Làm sao implement dark mode với prefers-color-scheme?

**EN:** `prefers-color-scheme` detects user's system color preference. Combine with CSS variables for easy theming.

```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #dddddd;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
    --border-color: #444444;
  }
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}

/* Or use color-scheme property */
:root {
  color-scheme: light dark;
}
```

**VI:** `prefers-color-scheme` phát hiện preference màu sắc của hệ thống người dùng. Kết hợp với CSS variables để dễ theming. Cũng có thể dùng `color-scheme: light dark`.

---

## 48. What is prefers-reduced-motion and why is it important? / prefers-reduced-motion là gì và tại sao quan trọng?

**EN:** `prefers-reduced-motion` respects users who experience motion sickness or prefer less animation. Important for accessibility.

```css
/* Default animations */
.element {
  transition: transform 0.3s ease;
}

@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Reduce/remove motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**VI:** `prefers-reduced-motion` tôn trọng người dùng bị say motion hoặc thích ít animation. Quan trọng cho accessibility. Nên giảm hoặc loại bỏ animations khi người dùng prefer reduced motion.

---

## 49. What are CSS Cascade Layers (@layer)? / CSS Cascade Layers (@layer) là gì?

**EN:** `@layer` controls cascade order explicitly. Later layers override earlier ones regardless of specificity. Great for managing third-party CSS.

```css
/* Define layer order */
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; }
}

@layer base {
  a { color: blue; }
}

@layer components {
  .button { padding: 1rem; }
}

@layer utilities {
  .hidden { display: none; } /* Always wins over components */
}

/* Unlayered styles beat all layers */
.special { color: red; }
```

**VI:** `@layer` điều khiển thứ tự cascade một cách rõ ràng. Layers sau override layers trước bất kể specificity. Tốt để quản lý CSS third-party và tổ chức code.

---

## 50. What is CSS Nesting and how does it work? / CSS Nesting là gì và hoạt động như thế nào?

**EN:** Native CSS nesting allows writing nested selectors like Sass. Use `&` to reference the parent selector.

```css
.card {
  padding: 1rem;
  background: white;

  /* Nested element */
  .card-title {
    font-size: 1.5rem;
  }

  /* & references parent */
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  /* Modifier */
  &.card--featured {
    border: 2px solid gold;
  }

  /* Media query nesting */
  @media (min-width: 768px) {
    padding: 2rem;
  }
}
```

**VI:** CSS nesting gốc cho phép viết selectors lồng nhau như Sass. Dùng `&` để tham chiếu parent selector. Hoạt động với pseudo-classes, modifiers, và media queries.

---

## 51. How do Container Queries differ from Media Queries? / Container Queries khác Media Queries như thế nào?

**EN:** Media Queries respond to viewport size, while Container Queries respond to a container's size. This enables truly reusable components that adapt to their context.

```css
/* Define containment */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Query container size, not viewport */
@container card (min-width: 400px) {
  .card { flex-direction: row; }
}

@container card (max-width: 399px) {
  .card { flex-direction: column; }
}

/* Container query units */
.card-title {
  font-size: clamp(1rem, 5cqi, 2rem); /* cqi = container query inline */
}
```

**VI:** Media Queries phản hồi kích thước viewport, còn Container Queries phản hồi kích thước container. Điều này cho phép tạo components thực sự tái sử dụng, tự thích ứng với ngữ cảnh chứa nó.

---

## 52. What are Container Query units? / Các đơn vị Container Query là gì?

**EN:** Container Query units are relative to the container's size: `cqw` (width), `cqh` (height), `cqi` (inline), `cqb` (block), `cqmin`, `cqmax`.

```css
.container {
  container-type: inline-size;
}

.responsive-text {
  /* 5% of container's inline size */
  font-size: 5cqi;

  /* Combine with clamp for safety */
  font-size: clamp(1rem, 4cqi, 2.5rem);
}

.responsive-padding {
  padding: 2cqw; /* 2% of container width */
}
```

**VI:** Các đơn vị Container Query tương đối với kích thước container: `cqw` (width), `cqh` (height), `cqi` (inline), `cqb` (block), `cqmin`, `cqmax`. Giống vw/vh nhưng cho container.

---

## 53. How do CSS Cascade Layers help manage specificity? / CSS Cascade Layers giúp quản lý specificity như thế nào?

**EN:** `@layer` creates explicit cascade priority, making layer order more important than specificity. Unlayered styles always win over layered styles.

```css
/* Define layer order first */
@layer reset, vendor, components, utilities;

/* Import third-party CSS into a layer */
@import url('bootstrap.css') layer(vendor);

@layer reset {
  * { margin: 0; box-sizing: border-box; }
}

@layer components {
  .btn { padding: 1rem 2rem; } /* Specificity: 0,1,0 */
}

@layer utilities {
  .p-0 { padding: 0 !important; } /* Wins over components */
}

/* Unlayered CSS wins over all layers */
.special-btn { padding: 3rem; }
```

**VI:** `@layer` tạo ưu tiên cascade rõ ràng, thứ tự layer quan trọng hơn specificity. Styles không có layer luôn thắng styles có layer. Hữu ích để quản lý CSS third-party.

---

## 54. What are CSS Logical Properties? / CSS Logical Properties là gì?

**EN:** Logical properties use `inline`/`block` instead of physical directions (left/right/top/bottom), adapting automatically to different writing modes and text directions.

```css
/* Physical (doesn't adapt to RTL) */
.box {
  margin-left: 1rem;
  margin-right: 2rem;
  padding-top: 1rem;
  width: 200px;
}

/* Logical (adapts to writing mode) */
.box {
  margin-inline-start: 1rem;  /* left in LTR, right in RTL */
  margin-inline-end: 2rem;
  padding-block-start: 1rem;  /* top in horizontal writing */
  inline-size: 200px;         /* width in horizontal */
}

/* Shorthand */
.box {
  margin-inline: 1rem 2rem;   /* start end */
  padding-block: 1rem;        /* both block directions */
}
```

**VI:** Logical properties dùng `inline`/`block` thay vì hướng vật lý (left/right/top/bottom), tự động thích ứng với writing modes và text directions khác nhau (LTR/RTL).

---

## 55. How do writing-mode and direction affect Logical Properties? / writing-mode và direction ảnh hưởng Logical Properties như thế nào?

**EN:** `writing-mode` changes block/inline flow direction. `direction` changes inline text direction. Logical properties automatically adapt.

```css
/* Horizontal LTR (default) */
.english {
  writing-mode: horizontal-tb;
  direction: ltr;
}

/* Horizontal RTL (Arabic, Hebrew) */
.arabic {
  direction: rtl;
}
.arabic .box {
  margin-inline-start: 2rem; /* Now applies to right side */
}

/* Vertical (Chinese, Japanese) */
.japanese {
  writing-mode: vertical-rl;
}
.japanese .box {
  inline-size: 300px;  /* Now controls height */
  block-size: 100%;    /* Now controls width */
}
```

**VI:** `writing-mode` thay đổi hướng flow block/inline. `direction` thay đổi hướng text inline. Logical properties tự động thích ứng, giúp xây dựng layouts đa ngôn ngữ dễ dàng.

---

## 56. What is the inset property in CSS? / Thuộc tính inset trong CSS là gì?

**EN:** `inset` is shorthand for `top`, `right`, `bottom`, `left`. It also has logical versions: `inset-inline` and `inset-block`.

```css
/* Old way */
.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* With inset shorthand */
.modal {
  position: fixed;
  inset: 0;
}

/* Different values */
.tooltip {
  position: absolute;
  inset: 10px 20px 30px 40px; /* top right bottom left */
}

/* Logical versions */
.sidebar {
  position: fixed;
  inset-block: 0;              /* top and bottom: 0 */
  inset-inline-start: 0;       /* left in LTR */
  inline-size: 250px;
}
```

**VI:** `inset` là shorthand cho `top`, `right`, `bottom`, `left`. Cũng có phiên bản logical: `inset-inline` và `inset-block`. Rất tiện cho positioned elements.

---

## 57. What is CSS Subgrid? / CSS Subgrid là gì?

**EN:** Subgrid allows nested grids to inherit track sizing from their parent grid, enabling perfect alignment across nested components.

```css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.card {
  grid-column: span 2;
  display: grid;
  /* Inherit parent's column tracks */
  grid-template-columns: subgrid;
}

/* Card children align with parent grid lines */
.card-image { grid-column: 1; }
.card-content { grid-column: 2; }

/* Subgrid for rows too */
.form {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
}
```

**VI:** Subgrid cho phép grid con kế thừa kích thước track từ grid cha, giúp căn chỉnh hoàn hảo giữa các components lồng nhau. Dùng `subgrid` thay vì định nghĩa tracks mới.

---

## 58. How do you use Subgrid for card layouts? / Làm sao dùng Subgrid cho card layouts?

**EN:** Subgrid ensures consistent alignment of card sections (header, content, footer) across multiple cards.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  /* Define row tracks for card sections */
  grid-template-rows: auto 1fr auto;
  gap: 2rem;
}

.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* Match parent's 3 row tracks */
}

/* All card headers align */
.card-header { /* row 1 */ }
/* All card bodies align even with different content length */
.card-body { /* row 2 */ }
/* All card footers align at bottom */
.card-footer { /* row 3 */ }
```

**VI:** Subgrid đảm bảo căn chỉnh đồng nhất các phần của card (header, content, footer) giữa nhiều cards. Headers cùng hàng, footers cùng hàng dù content dài ngắn khác nhau.

---

## 59. What is CSS Masonry layout? / CSS Masonry layout là gì?

**EN:** Masonry layout fills vertical gaps in grid layouts (like Pinterest). Currently experimental, uses `masonry` value for grid-template-rows/columns.

```css
/* Experimental - check browser support */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-template-rows: masonry; /* Items pack vertically */
  gap: 1rem;
}

/* Current workaround using columns */
.gallery-fallback {
  columns: 4 200px;
  column-gap: 1rem;
}

.gallery-fallback .item {
  break-inside: avoid;
  margin-bottom: 1rem;
}
```

**VI:** Masonry layout lấp đầy khoảng trống dọc trong grid layouts (như Pinterest). Hiện đang experimental, dùng giá trị `masonry` cho grid-template-rows/columns. Có thể dùng CSS columns làm fallback.

---

## 60. How does CSS Scroll Snap work? / CSS Scroll Snap hoạt động như thế nào?

**EN:** Scroll Snap creates controlled scroll positions, snapping to defined points. Great for carousels and full-page sections.

```css
/* Container */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory; /* or proximity */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Items */
.slide {
  flex: 0 0 100%;
  scroll-snap-align: start; /* or center, end */
}

/* Full-page sections */
.fullpage {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.section {
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always; /* Prevent skipping */
}
```

**VI:** Scroll Snap tạo các vị trí scroll được kiểm soát, snap đến các điểm định nghĩa. Tuyệt vời cho carousels và full-page sections. `mandatory` ép snap, `proximity` snap khi gần.

---

## 61. What scroll-snap properties are available? / Những thuộc tính scroll-snap nào có sẵn?

**EN:** Key scroll-snap properties on container and children:

```css
/* Container properties */
.container {
  scroll-snap-type: x mandatory;   /* axis + strictness */
  scroll-padding: 1rem;            /* offset snap position */
  scroll-padding-inline: 20px;     /* logical property */
}

/* Child properties */
.item {
  scroll-snap-align: center;       /* start | center | end */
  scroll-snap-stop: always;        /* always | normal */
  scroll-margin: 10px;             /* offset from container edge */
}

/* Practical example: header offset */
.page {
  scroll-snap-type: y proximity;
  scroll-padding-top: 60px; /* Account for fixed header */
}
```

**VI:** Thuộc tính container: `scroll-snap-type`, `scroll-padding`. Thuộc tính child: `scroll-snap-align`, `scroll-snap-stop`, `scroll-margin`. Dùng scroll-padding để tính header cố định.

---

## 62. What are Scroll-driven Animations? / Scroll-driven Animations là gì?

**EN:** Scroll-driven animations link animation progress to scroll position instead of time. Uses `animation-timeline` with `scroll()` or `view()`.

```css
/* Animation linked to scroll progress */
.progress-bar {
  animation: grow linear;
  animation-timeline: scroll(); /* Default: nearest scrollable ancestor */
}

@keyframes grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Specify scroll container */
.element {
  animation: fadeIn linear;
  animation-timeline: scroll(root); /* Viewport scroll */
}

/* Named timeline */
.scroll-container {
  scroll-timeline-name: --main-scroll;
  scroll-timeline-axis: block;
}

.animated-element {
  animation-timeline: --main-scroll;
}
```

**VI:** Scroll-driven animations liên kết tiến trình animation với vị trí scroll thay vì thời gian. Dùng `animation-timeline` với `scroll()` hoặc `view()`. Tạo hiệu ứng parallax và reveal.

---

## 63. How does view() timeline work for scroll animations? / view() timeline hoạt động như thế nào cho scroll animations?

**EN:** `view()` triggers animation based on element's visibility in the viewport (scroll-triggered animations).

```css
/* Animate when element enters viewport */
.reveal {
  animation: fadeIn linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%; /* Start to end points */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Control animation range */
.parallax-image {
  animation: parallax linear;
  animation-timeline: view();
  animation-range: contain 0% contain 100%;
}

@keyframes parallax {
  from { transform: translateY(-20%); }
  to { transform: translateY(20%); }
}
```

**VI:** `view()` trigger animation dựa trên visibility của element trong viewport. Dùng `animation-range` để kiểm soát khi nào animation bắt đầu/kết thúc (entry, exit, contain, cover).

---

## 64. What is the :has() selector and advanced use cases? / Selector :has() và các use cases nâng cao?

**EN:** `:has()` selects parents based on children, enabling previously impossible CSS patterns.

```css
/* Style parent based on child state */
.form-group:has(input:focus) {
  box-shadow: 0 0 0 2px blue;
}

/* Conditional grid layout */
.card:has(img) {
  grid-template-rows: 200px 1fr;
}
.card:not(:has(img)) {
  grid-template-rows: 1fr;
}

/* Previous sibling selector (using :has) */
h2:has(+ p) { margin-bottom: 0.5rem; }

/* Global state changes */
body:has(.modal.open) {
  overflow: hidden;
}

/* Quantity queries */
ul:has(li:nth-child(5)) { /* Has at least 5 items */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

**VI:** `:has()` chọn parents dựa trên children, cho phép các patterns CSS trước đây không thể làm được. Có thể style parent khi child focus, thay đổi layout có điều kiện, thậm chí chọn sibling trước.

---

## 65. How do :where() and :is() differ in specificity handling? / :where() và :is() khác nhau về specificity như thế nào?

**EN:** `:is()` takes the highest specificity of its arguments. `:where()` always has zero specificity, making it perfect for defaults.

```css
/* :is() - takes highest specificity */
:is(#header, .nav, footer) a {
  color: blue;
  /* Specificity: (1,0,1) from #header */
}

/* :where() - zero specificity */
:where(#header, .nav, footer) a {
  color: blue;
  /* Specificity: (0,0,1) just the 'a' */
}

/* Use :where() for easily overridable defaults */
:where(.btn) {
  padding: 1rem;
  border: none;
  background: gray;
}

/* Easy to override without specificity issues */
.btn { background: blue; } /* This wins */

/* Combine for best of both */
:where(article, section) :is(h1, h2, h3) {
  margin-block: 1em;
}
```

**VI:** `:is()` lấy specificity cao nhất của arguments. `:where()` luôn có specificity bằng 0, hoàn hảo cho defaults dễ override. Kết hợp cả hai để tối ưu.

---

## 66. What is aspect-ratio in CSS? / aspect-ratio trong CSS là gì?

**EN:** `aspect-ratio` maintains an element's width-to-height ratio without padding hacks. Works with or without explicit dimensions.

```css
/* Basic usage */
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

/* Square elements */
.avatar {
  aspect-ratio: 1;  /* Same as 1 / 1 */
  width: 50px;
  border-radius: 50%;
}

/* With responsive images */
img {
  aspect-ratio: 4 / 3;
  width: 100%;
  object-fit: cover;
}

/* Old padding hack (no longer needed) */
.old-way {
  position: relative;
  padding-bottom: 56.25%; /* 9/16 = 56.25% */
}
```

**VI:** `aspect-ratio` duy trì tỷ lệ width/height của element mà không cần padding hacks. Hoạt động với hoặc không có dimensions rõ ràng. `16/9` cho video, `1` cho hình vuông.

---

## 67. How do object-fit and object-position work? / object-fit và object-position hoạt động như thế nào?

**EN:** `object-fit` controls how replaced content (img, video) fits its container. `object-position` sets the alignment.

```css
/* object-fit values */
img {
  width: 300px;
  height: 200px;
}

.cover { object-fit: cover; }      /* Crop to fill, maintain ratio */
.contain { object-fit: contain; }  /* Fit inside, may letterbox */
.fill { object-fit: fill; }        /* Stretch to fill, distort */
.none { object-fit: none; }        /* Original size, may overflow */
.scale-down { object-fit: scale-down; } /* Smaller of none or contain */

/* object-position */
.thumbnail {
  object-fit: cover;
  object-position: top center;    /* Focus on top */
  object-position: 25% 75%;       /* Custom position */
}

/* Common pattern: hero images */
.hero-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  object-position: center 30%;    /* Focus slightly above center */
}
```

**VI:** `object-fit` kiểm soát cách nội dung replaced (img, video) vừa container. `object-position` đặt vị trí căn chỉnh. `cover` để lấp đầy và crop, `contain` để vừa khít bên trong.

---

## 68. What is content-visibility for performance? / content-visibility cho hiệu suất là gì?

**EN:** `content-visibility` skips rendering off-screen content, dramatically improving initial load performance for long pages.

```css
/* Skip rendering until needed */
.section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* Estimated height for scrollbar */
}

/* content-visibility values */
.hidden { content-visibility: hidden; }    /* Like display:none but keeps state */
.visible { content-visibility: visible; }  /* Default */
.auto { content-visibility: auto; }        /* Render when near viewport */

/* Practical example: long list */
.article-list .article {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}

/* Combine with containment */
.card {
  content-visibility: auto;
  contain: layout style paint;
  contain-intrinsic-block-size: 200px;
}
```

**VI:** `content-visibility` bỏ qua rendering nội dung ngoài màn hình, cải thiện đáng kể hiệu suất tải cho trang dài. `auto` render khi gần viewport. Dùng `contain-intrinsic-size` cho scrollbar chính xác.

---

## 69. How does CSS contain property improve performance? / Thuộc tính contain trong CSS cải thiện hiệu suất như thế nào?

**EN:** `contain` isolates element's rendering from the rest of the page, limiting browser's recalculation scope.

```css
/* Containment types */
.widget {
  contain: layout;   /* Position changes don't affect outside */
  contain: paint;    /* Content won't render outside bounds */
  contain: size;     /* Size independent of children */
  contain: style;    /* Counters/quotes don't escape */
  contain: content;  /* layout + paint + style */
  contain: strict;   /* layout + paint + size + style */
}

/* Common pattern: isolated components */
.card {
  contain: content;
}

/* For virtualized lists */
.list-item {
  contain: strict;
  height: 50px;
}

/* With content-visibility */
.section {
  contain: layout style paint;
  content-visibility: auto;
}
```

**VI:** `contain` cô lập rendering của element khỏi phần còn lại của trang, giới hạn phạm vi tính toán lại của browser. `content` = layout + paint + style. `strict` thêm size.

---

## 70. What is the CSS Paint API (Houdini)? / CSS Paint API (Houdini) là gì?

**EN:** CSS Paint API lets you programmatically generate images with JavaScript, enabling custom backgrounds, borders, and masks.

```css
/* Register and use custom paint worklet */
.element {
  background-image: paint(myPattern);
  --pattern-color: blue;
  --pattern-size: 20;
}

/* Multiple paint worklets */
.fancy-border {
  border-image: paint(fancyBorder) 1;
  --border-color: coral;
}
```

```javascript
// my-paint.js - registered as worklet
registerPaint('myPattern', class {
  static get inputProperties() {
    return ['--pattern-color', '--pattern-size'];
  }

  paint(ctx, size, props) {
    const color = props.get('--pattern-color').toString();
    const cellSize = parseInt(props.get('--pattern-size'));

    ctx.fillStyle = color;
    for (let x = 0; x < size.width; x += cellSize) {
      for (let y = 0; y < size.height; y += cellSize) {
        if ((x + y) % (cellSize * 2) === 0) {
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }
});

// Register in main JS
CSS.paintWorklet.addModule('my-paint.js');
```

**VI:** CSS Paint API cho phép tạo hình ảnh theo chương trình bằng JavaScript, cho phép custom backgrounds, borders, masks. Là một phần của CSS Houdini. Dùng CSS variables để truyền tham số vào worklet.
