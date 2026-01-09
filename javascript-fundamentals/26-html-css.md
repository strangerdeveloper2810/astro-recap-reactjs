# HTML & CSS Fundamentals

## Level 1: Basic - HTML Structure & CSS Basics

### 1.1. Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Page description for SEO">
  <title>Page Title</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>Article Title</h1>
        <time datetime="2024-01-15">January 15, 2024</time>
      </header>
      <section>
        <h2>Section Heading</h2>
        <p>Content...</p>
      </section>
    </article>

    <aside>
      <h2>Related Articles</h2>
    </aside>
  </main>

  <footer>
    <p>&copy; 2024 Company Name</p>
  </footer>
</body>
</html>
```

### 1.2. Semantic HTML Elements

```html
<!-- Structural Elements -->
<header>   <!-- Page or section header -->
<nav>      <!-- Navigation links -->
<main>     <!-- Main content (one per page) -->
<article>  <!-- Self-contained content -->
<section>  <!-- Thematic grouping -->
<aside>    <!-- Sidebar, related content -->
<footer>   <!-- Page or section footer -->

<!-- Text Elements -->
<h1> to <h6>  <!-- Headings (h1 = most important) -->
<p>            <!-- Paragraph -->
<blockquote>   <!-- Quotation -->
<pre>          <!-- Preformatted text -->
<code>         <!-- Code snippet -->

<!-- Lists -->
<ul>  <!-- Unordered list -->
<ol>  <!-- Ordered list -->
<li>  <!-- List item -->
<dl>  <!-- Description list -->
<dt>  <!-- Term -->
<dd>  <!-- Description -->

<!-- Forms -->
<form>     <!-- Form container -->
<fieldset> <!-- Group related fields -->
<legend>   <!-- Caption for fieldset -->
<label>    <!-- Label for input -->
<input>    <!-- Input field -->
<textarea> <!-- Multi-line text -->
<select>   <!-- Dropdown -->
<button>   <!-- Button -->

<!-- Media -->
<figure>     <!-- Self-contained media -->
<figcaption> <!-- Caption for figure -->
<picture>    <!-- Responsive images -->
<video>      <!-- Video content -->
<audio>      <!-- Audio content -->

<!-- Other -->
<time datetime="2024-01-15">  <!-- Date/time -->
<mark>                         <!-- Highlighted text -->
<details>                      <!-- Expandable content -->
<summary>                      <!-- Summary for details -->
```

### 1.3. CSS Box Model

```
┌─────────────────────────────────────────────────────┐
│                     MARGIN                           │
│   ┌─────────────────────────────────────────────┐   │
│   │                  BORDER                      │   │
│   │   ┌─────────────────────────────────────┐   │   │
│   │   │              PADDING                 │   │   │
│   │   │   ┌─────────────────────────────┐   │   │   │
│   │   │   │          CONTENT             │   │   │   │
│   │   │   │                              │   │   │   │
│   │   │   └─────────────────────────────┘   │   │   │
│   │   └─────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

```css
/* Box sizing */
* {
  box-sizing: border-box; /* width includes padding + border */
}

/* Default: content-box - width is only content */

.box {
  width: 200px;
  padding: 20px;
  border: 1px solid black;
  margin: 10px;
}

/* content-box: total width = 200 + 40 + 2 = 242px */
/* border-box: total width = 200px (content shrinks) */
```

### 1.4. Display Property

```css
/* Block - takes full width, starts new line */
display: block;
/* Default: div, p, h1-h6, section, article, form */

/* Inline - only takes needed width, no new line */
display: inline;
/* Default: span, a, strong, em, img */

/* Inline-block - inline + can set width/height */
display: inline-block;

/* None - removes from layout and visual */
display: none;

/* Hidden - hidden but keeps space */
visibility: hidden;

/* Flex - flexbox container */
display: flex;

/* Grid - grid container */
display: grid;
```

### 1.5. CSS Selectors

```css
/* Basic Selectors */
element        /* Type selector */
.class         /* Class selector */
#id            /* ID selector */
*              /* Universal selector */

/* Combinators */
div p          /* Descendant (any level) */
div > p        /* Direct child */
div + p        /* Adjacent sibling (next) */
div ~ p        /* General sibling (all after) */

/* Attribute Selectors */
[attr]         /* Has attribute */
[attr="value"] /* Exact value */
[attr^="val"]  /* Starts with */
[attr$="val"]  /* Ends with */
[attr*="val"]  /* Contains */

/* Pseudo-classes (state) */
:hover         /* Mouse over */
:focus         /* Has focus */
:active        /* Being clicked */
:first-child   /* First child of parent */
:last-child    /* Last child */
:nth-child(2)  /* 2nd child */
:nth-child(odd)   /* Odd children */
:nth-child(2n+1)  /* Every 2nd starting at 1 */
:not(.class)   /* Negation */

/* Pseudo-elements (create elements) */
::before       /* Insert before content */
::after        /* Insert after content */
::first-line   /* First line of text */
::first-letter /* First letter */
::placeholder  /* Input placeholder */
::selection    /* Selected text */
```

---

## Level 2: Intermediate - Flexbox, Grid & Responsive Design

### 2.1. Flexbox Container

```css
.container {
  display: flex;

  /* Main axis direction */
  flex-direction: row;           /* default: left to right */
  flex-direction: row-reverse;   /* right to left */
  flex-direction: column;        /* top to bottom */
  flex-direction: column-reverse;

  /* Wrapping */
  flex-wrap: nowrap;   /* default: single line */
  flex-wrap: wrap;     /* multi-line */
  flex-wrap: wrap-reverse;

  /* Main axis alignment (justify-content) */
  justify-content: flex-start;    /* default: start */
  justify-content: flex-end;      /* end */
  justify-content: center;        /* center */
  justify-content: space-between; /* first at start, last at end */
  justify-content: space-around;  /* equal space around items */
  justify-content: space-evenly;  /* equal space between items */

  /* Cross axis alignment (align-items) */
  align-items: stretch;     /* default: stretch to fill */
  align-items: flex-start;  /* start of cross axis */
  align-items: flex-end;    /* end of cross axis */
  align-items: center;      /* center of cross axis */
  align-items: baseline;    /* text baseline */

  /* Gap between items */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;
}
```

### 2.2. Flexbox Items

```css
.item {
  /* Order - change visual order */
  order: 0;    /* default, can be negative */

  /* Grow - how much item grows relative to others */
  flex-grow: 0;    /* default: don't grow */
  flex-grow: 1;    /* grow to fill space */

  /* Shrink - how much item shrinks */
  flex-shrink: 1;  /* default: can shrink */
  flex-shrink: 0;  /* don't shrink */

  /* Basis - initial size before growing/shrinking */
  flex-basis: auto;   /* default: use content size */
  flex-basis: 200px;  /* fixed starting size */
  flex-basis: 0;      /* ignore content size */

  /* Shorthand: grow shrink basis */
  flex: 0 1 auto;     /* default */
  flex: 1;            /* 1 1 0 - grow equally, ignore content */
  flex: none;         /* 0 0 auto - fixed size */
  flex: 1 0 200px;    /* grow but don't shrink, 200px min */

  /* Self alignment (override container) */
  align-self: auto;
  align-self: flex-start;
  align-self: center;
  align-self: flex-end;
}
```

### 2.3. Flexbox Common Patterns

```css
/* Center content vertically and horizontally */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Space between with edges */
.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Equal width columns */
.equal-columns {
  display: flex;
}
.equal-columns > * {
  flex: 1;
}

/* Sticky footer */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1; /* Takes remaining space */
}

/* Navigation with logo and menu */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### 2.4. CSS Grid Container

```css
.container {
  display: grid;

  /* Define columns */
  grid-template-columns: 200px 200px 200px;     /* 3 fixed columns */
  grid-template-columns: 1fr 1fr 1fr;           /* 3 equal columns */
  grid-template-columns: repeat(3, 1fr);        /* same as above */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* responsive */
  grid-template-columns: 200px 1fr 2fr;         /* mixed */

  /* Define rows */
  grid-template-rows: 100px auto 100px;
  grid-template-rows: repeat(3, 1fr);

  /* Gap */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;

  /* Template areas (named regions) */
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";

  /* Alignment */
  justify-items: start;   /* align items horizontally in cell */
  align-items: start;     /* align items vertically in cell */
  place-items: center;    /* shorthand for both */

  justify-content: center;  /* align grid horizontally in container */
  align-content: center;    /* align grid vertically in container */
}
```

### 2.5. CSS Grid Items

```css
.item {
  /* Column placement */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-column: 1 / 3;        /* shorthand */
  grid-column: 1 / span 2;   /* span 2 columns */

  /* Row placement */
  grid-row-start: 1;
  grid-row-end: 3;
  grid-row: 1 / 3;

  /* Full shorthand: row-start / col-start / row-end / col-end */
  grid-area: 1 / 1 / 3 / 3;

  /* Named area */
  grid-area: header;

  /* Self alignment */
  justify-self: start;
  align-self: center;
  place-self: center;
}
```

### 2.6. Responsive Design

```css
/* Mobile first approach */
.container {
  width: 100%;
  padding: 10px;
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
  .container {
    width: 970px;
  }
}

/* Large desktop (1200px and up) */
@media (min-width: 1200px) {
  .container {
    width: 1170px;
  }
}

/* Other media queries */
@media (max-width: 767px) { /* mobile only */ }
@media (orientation: landscape) { }
@media (prefers-color-scheme: dark) { }
@media (prefers-reduced-motion: reduce) { }
```

### 2.7. Responsive Units

```css
/* Relative units */
em      /* relative to parent font-size */
rem     /* relative to root (html) font-size */
%       /* relative to parent */
vw      /* 1% of viewport width */
vh      /* 1% of viewport height */
vmin    /* smaller of vw/vh */
vmax    /* larger of vw/vh */

/* Fluid typography */
html {
  font-size: 16px;
}

h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
  /* min: 1.5rem, preferred: 4vw, max: 3rem */
}

/* Responsive container */
.container {
  width: min(100%, 1200px);
  padding: clamp(1rem, 5vw, 3rem);
}
```

---

## Level 3: Advanced - Performance, Architecture & Modern CSS

### 3.1. CSS Specificity

```
Specificity: (inline, ID, class, element)

#id              = (0, 1, 0, 0) = 100
.class           = (0, 0, 1, 0) = 10
element          = (0, 0, 0, 1) = 1
style=""         = (1, 0, 0, 0) = 1000
!important       = wins all (avoid using)

Examples:
#nav .item       = (0, 1, 1, 0) = 110
div.class#id     = (0, 1, 1, 1) = 111
ul li a          = (0, 0, 0, 3) = 3
.nav .item:hover = (0, 0, 3, 0) = 30

Rules:
1. Higher specificity wins
2. Same specificity: later rule wins
3. !important overrides all (use sparingly)
4. Inline styles override stylesheets
```

### 3.2. CSS Variables (Custom Properties)

```css
:root {
  /* Color palette */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;

  /* Spacing system */
  --spacing-unit: 8px;
  --spacing-sm: calc(var(--spacing-unit) * 1);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);

  /* Typography */
  --font-size-base: 16px;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.button {
  background-color: var(--primary-color);
  padding: var(--spacing-md);
  font-family: var(--font-family);
  box-shadow: var(--shadow-md);
}

/* Override in component/theme */
.dark-theme {
  --primary-color: #0056b3;
  --background: #1a1a1a;
}

/* Fallback value */
.element {
  color: var(--undefined-var, #333);
}
```

### 3.3. CSS Functions

```css
/* calc() - mathematical operations */
width: calc(100% - 20px);
font-size: calc(1rem + 1vw);
margin: calc(var(--spacing-unit) * 2);

/* clamp() - responsive with constraints */
font-size: clamp(1rem, 2vw, 2rem);    /* min, preferred, max */
width: clamp(200px, 50%, 800px);

/* min() / max() */
width: min(100%, 800px);    /* smaller of two values */
width: max(300px, 50%);     /* larger of two values */

/* Modern color functions */
color: hsl(210, 100%, 50%);           /* hue, saturation, lightness */
color: hsla(210, 100%, 50%, 0.5);     /* with alpha */
color: rgb(0 123 255 / 50%);          /* modern syntax */

/* Color manipulation (future/experimental) */
color: color-mix(in srgb, blue 50%, red);
```

### 3.4. Transitions & Animations

```css
/* Transitions */
.button {
  background-color: blue;
  transform: scale(1);
  transition: all 0.3s ease;
  /* transition: property duration timing-function delay */
  transition: background-color 0.3s ease, transform 0.2s ease-out;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  background-color: darkblue;
  transform: scale(1.05);
}

/* Keyframe Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.element {
  animation: fadeIn 0.5s ease-out forwards;
  /* animation: name duration timing-function delay iteration-count direction fill-mode */
}

/* Multiple animations */
.element {
  animation:
    fadeIn 0.5s ease-out,
    pulse 2s ease-in-out infinite;
}

/* Performance tip: use transform and opacity for animations */
/* They don't trigger layout/paint, only composite */
```

### 3.5. Positioning

```css
/* Static - default, normal flow */
position: static;

/* Relative - offset from normal position */
position: relative;
top: 10px;
left: 20px;
/* Still takes space in normal flow */

/* Absolute - positioned relative to nearest positioned ancestor */
position: absolute;
top: 0;
right: 0;
/* Removed from normal flow */
/* If no positioned ancestor, positions to viewport */

/* Fixed - positioned relative to viewport */
position: fixed;
top: 0;
left: 0;
/* Stays in place during scroll */

/* Sticky - toggles between relative and fixed */
position: sticky;
top: 0;
/* Sticks when reaching scroll position */

/* Z-index - stacking order (only works on positioned elements) */
z-index: 100;
/* Higher values appear on top */
/* Creates stacking context */
```

### 3.6. Accessibility (a11y)

```html
<!-- ARIA attributes -->
<button aria-label="Close menu" aria-expanded="false">
  <span aria-hidden="true">&times;</span>
</button>

<!-- Role attribute -->
<div role="alert">Error message</div>
<div role="dialog" aria-modal="true">Modal content</div>

<!-- Screen reader only (visually hidden) -->
<span class="sr-only">Skip to main content</span>

<!-- Form accessibility -->
<label for="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-hint"
>
<span id="email-hint">Enter your email address</span>

<!-- Image accessibility -->
<img src="chart.png" alt="Sales chart showing 20% growth in Q4">

<!-- Keyboard navigation -->
<button tabindex="0">Focusable</button>
<div tabindex="-1">Programmatically focusable only</div>
```

```css
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles */
:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Focus visible (keyboard only) */
:focus-visible {
  outline: 2px solid var(--primary-color);
}

:focus:not(:focus-visible) {
  outline: none;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3.7. Container Queries (Modern CSS)

```css
/* Container queries - style based on container size, not viewport */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Query container size */
@container card (min-width: 400px) {
  .card {
    display: flex;
    gap: 1rem;
  }

  .card-image {
    width: 150px;
  }
}

@container card (max-width: 399px) {
  .card {
    display: block;
  }

  .card-image {
    width: 100%;
  }
}
```

### 3.8. Modern Selectors

```css
/* :is() - matches any selector in list (forgiving) */
:is(h1, h2, h3) {
  margin-top: 1.5rem;
}

/* Same as writing: */
h1, h2, h3 { margin-top: 1.5rem; }

/* :where() - like :is() but zero specificity */
:where(h1, h2, h3) {
  color: inherit; /* Easy to override */
}

/* :has() - parent selector */
.card:has(.card-image) {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* Card without image */
.card:not(:has(.card-image)) {
  display: block;
}

/* :has() with form validation */
.form-group:has(:invalid) {
  border-color: red;
}

.form-group:has(:focus) {
  border-color: blue;
}
```

---

## Real-world Applications

### Responsive Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--text-muted);
  line-height: 1.6;
}
```

### Holy Grail Layout

```css
.page {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .page {
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### Form Styling

```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input:invalid:not(:placeholder-shown) {
  border-color: var(--danger-color);
}

.form-input:valid:not(:placeholder-shown) {
  border-color: var(--success-color);
}

.form-error {
  display: none;
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-input:invalid:not(:placeholder-shown) + .form-error {
  display: block;
}
```

### Dark Mode Toggle

```css
:root {
  /* Light theme (default) */
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --border-color: #e5e5e5;
  --card-bg: #f5f5f5;
}

/* Dark theme */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --border-color: #333333;
  --card-bg: #2a2a2a;
}

/* System preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --border-color: #333333;
    --card-bg: #2a2a2a;
  }
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}
```

```javascript
// Toggle dark mode
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}
```

---

## Interview Questions

### Level 1: Basic

**1. Box model là gì?**
```
Content → Padding → Border → Margin

- Content: nội dung (text, image)
- Padding: space giữa content và border
- Border: đường viền
- Margin: space giữa element và elements khác

box-sizing: border-box → width bao gồm padding + border
box-sizing: content-box → width chỉ là content (default)
```

**2. Block vs Inline elements?**
```
Block:
- Chiếm full width available
- Bắt đầu dòng mới
- Có thể set width/height
- Examples: div, p, h1-h6, section

Inline:
- Chỉ chiếm width cần thiết
- Không bắt đầu dòng mới
- Không thể set width/height
- Examples: span, a, strong, em

Inline-block:
- Inline nhưng có thể set width/height
```

**3. Semantic HTML là gì? Tại sao quan trọng?**
```
Semantic = HTML elements có ý nghĩa

Examples: <header>, <nav>, <main>, <article>, <footer>

Tại sao quan trọng:
1. SEO - search engines hiểu cấu trúc trang
2. Accessibility - screen readers đọc đúng
3. Maintainability - code dễ đọc, dễ bảo trì
4. Styling - có thể target cụ thể
```

### Level 2: Intermediate

**4. Flexbox vs Grid?**
```
Flexbox:
- 1-dimensional (row HOẶC column)
- Content-first (items quyết định layout)
- Tốt cho: navigation, card rows, centering

Grid:
- 2-dimensional (rows VÀ columns)
- Layout-first (grid quyết định layout)
- Tốt cho: page layouts, complex grids

Use together:
- Grid cho layout chính
- Flexbox cho components bên trong
```

**5. CSS Specificity order?**
```
!important > inline style > ID > class/attribute/pseudo-class > element

Tính điểm: (inline, ID, class, element)
#nav .item → (0, 1, 1, 0) = 110
div.class  → (0, 0, 1, 1) = 11

Khi cùng specificity: rule sau wins
```

**6. Responsive design approach?**
```
Mobile-first:
- Start với mobile styles
- Add complexity via min-width queries
- Progressive enhancement

Desktop-first:
- Start với desktop styles
- Simplify via max-width queries
- Graceful degradation

Best practice: Mobile-first với:
- Relative units (rem, em, %)
- Flexible layouts (flex, grid)
- clamp() for fluid typography
```

### Level 3: Advanced

**7. CSS performance tips?**
```
1. Avoid deep selectors (max 3 levels)
2. Use transform/opacity for animations
3. will-change for heavy animations (sparingly)
4. Minimize reflows (batch DOM changes)
5. Use CSS containment (contain: layout)
6. Lazy load below-fold CSS

What causes reflow:
- Changing dimensions (width, height, padding)
- Changing position
- Changing font-size
- Adding/removing DOM elements
```

**8. BEM naming convention?**
```css
/* Block__Element--Modifier */
.card { }
.card__title { }
.card__title--large { }
.card__image { }
.card--featured { }

Benefits:
- Self-documenting
- Low specificity
- No nesting issues
- Easy to understand
```

**9. CSS-in-JS vs traditional CSS?**
```
CSS-in-JS (styled-components, Emotion):
✅ Scoped by default
✅ Dynamic styling with JS
✅ Co-located with components
❌ Runtime overhead
❌ Larger bundle

Traditional CSS (CSS Modules, Tailwind):
✅ No runtime overhead
✅ Caching benefits
✅ Familiar syntax
❌ Global scope issues (without modules)
❌ Separate files

Modern approach: CSS Modules hoặc Tailwind
```

**10. Container queries vs Media queries?**
```
Media queries:
- Based on viewport size
- Good for page-level layouts
- @media (min-width: 768px)

Container queries:
- Based on container size
- Good for component-level responsive
- @container (min-width: 400px)
- Component works anywhere

Container queries = truly reusable components
```
