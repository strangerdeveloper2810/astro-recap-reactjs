# DOM Manipulation

## 1. DOM Basics

### DOM Tree Structure

```javascript
// Document Object Model - representation of HTML as tree
// document là root node

// Node types:
// - Element nodes: <div>, <p>, etc.
// - Text nodes: text content
// - Comment nodes: <!-- comments -->
// - Document node: root
```

### Selecting Elements

```javascript
// getElementById - single element
const element = document.getElementById('myId');

// getElementsByClassName - HTMLCollection (live)
const elements = document.getElementsByClassName('myClass');

// getElementsByTagName - HTMLCollection (live)
const divs = document.getElementsByTagName('div');

// querySelector - first matching element
const element = document.querySelector('.myClass');
const element = document.querySelector('#myId');
const element = document.querySelector('div.container');

// querySelectorAll - NodeList (static)
const elements = document.querySelectorAll('.myClass');
const elements = document.querySelectorAll('div, p, span');

// Modern: có thể gọi từ element
const container = document.querySelector('.container');
const children = container.querySelectorAll('.child');
```

### Differences: HTMLCollection vs NodeList

```javascript
// HTMLCollection - live collection
const live = document.getElementsByClassName('item');
console.log(live.length); // 3
document.body.appendChild(document.createElement('div'));
console.log(live.length); // 4 (updated automatically)

// NodeList - static collection (querySelectorAll)
const static = document.querySelectorAll('.item');
console.log(static.length); // 3
document.body.appendChild(document.createElement('div'));
console.log(static.length); // 3 (not updated)

// Convert to Array
const array1 = Array.from(live);
const array2 = [...static];
```

## 2. Creating & Modifying Elements

### Creating Elements

```javascript
// createElement
const div = document.createElement('div');
div.textContent = 'Hello World';
div.className = 'container';
div.id = 'myDiv';

// createTextNode
const text = document.createTextNode('Hello');

// createDocumentFragment (performance)
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment); // Single reflow
```

### Modifying Elements

```javascript
// Text content
element.textContent = 'New text'; // Plain text, escape HTML
element.innerHTML = '<strong>Bold</strong>'; // HTML, security risk
element.innerText = 'Text'; // Visible text only

// Attributes
element.setAttribute('id', 'myId');
element.getAttribute('id');
element.removeAttribute('id');
element.hasAttribute('id');

// Direct property access
element.id = 'myId';
element.className = 'container';
element.href = 'https://example.com';

// classList (modern)
element.classList.add('active');
element.classList.remove('active');
element.classList.toggle('active');
element.classList.contains('active');
element.classList.replace('old', 'new');

// Style
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.cssText = 'color: red; background: blue;';
// Hoặc
Object.assign(element.style, {
  color: 'red',
  backgroundColor: 'blue'
});
```

### Inserting Elements

```javascript
// appendChild - add to end
parent.appendChild(child);

// insertBefore
parent.insertBefore(newChild, referenceChild);

// insertAdjacentElement
element.insertAdjacentElement('beforebegin', newElement);
element.insertAdjacentElement('afterbegin', newElement);
element.insertAdjacentElement('beforeend', newElement);
element.insertAdjacentElement('afterend', newElement);

// insertAdjacentHTML (careful with XSS)
element.insertAdjacentHTML('beforeend', '<div>New</div>');

// Modern methods
parent.append(child1, child2, child3); // Multiple children
parent.prepend(child); // Add to beginning
element.before(sibling); // Before element
element.after(sibling); // After element
element.replaceWith(newElement); // Replace element
```

## 3. Traversing DOM

### Parent/Child Navigation

```javascript
// Parent
element.parentElement;
element.parentNode;

// Children
element.children; // HTMLCollection of Element nodes
element.childNodes; // NodeList of all nodes (text, comment, etc.)
element.firstElementChild;
element.lastElementChild;
element.firstChild;
element.lastChild;

// Siblings
element.nextElementSibling;
element.previousElementSibling;
element.nextSibling;
element.previousSibling;

// Check relationships
element.contains(otherElement);
element.matches('.selector');
element.closest('.selector'); // First ancestor matching selector
```

### Practical Traversal

```javascript
// Find all parents
function getAllParents(element) {
  const parents = [];
  let current = element.parentElement;
  while (current) {
    parents.push(current);
    current = current.parentElement;
  }
  return parents;
}

// Find siblings
function getAllSiblings(element) {
  return Array.from(element.parentElement.children)
    .filter(child => child !== element);
}

// Find descendants
function findDescendants(element, selector) {
  return Array.from(element.querySelectorAll(selector));
}
```

## 4. Events

### Event Listeners

```javascript
// addEventListener (recommended)
element.addEventListener('click', handleClick);
element.addEventListener('click', handleClick, { once: true });
element.addEventListener('click', handleClick, { capture: true });
element.addEventListener('click', handleClick, { passive: true });

// removeEventListener
element.removeEventListener('click', handleClick);

// Event object
function handleClick(event) {
  event.preventDefault(); // Prevent default behavior
  event.stopPropagation(); // Stop bubbling
  event.stopImmediatePropagation(); // Stop all handlers
  
  console.log(event.target); // Element that triggered
  console.log(event.currentTarget); // Element with listener
  console.log(event.type); // 'click'
  console.log(event.clientX, event.clientY); // Mouse position
}

// Inline handlers (not recommended)
<button onclick="handleClick()">Click</button>

// Event properties (legacy, not recommended)
element.onclick = handleClick;
```

### Event Delegation

```javascript
// ❌ Inefficient: listener on each item
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});

// ✅ Efficient: single listener on parent
document.querySelector('.container').addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e);
  }
});

// With closest (better for nested elements)
document.querySelector('.container').addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) {
    handleClick(e, item);
  }
});
```

### Common Events

```javascript
// Mouse events
element.addEventListener('click', handler);
element.addEventListener('dblclick', handler);
element.addEventListener('mousedown', handler);
element.addEventListener('mouseup', handler);
element.addEventListener('mousemove', handler);
element.addEventListener('mouseenter', handler); // No bubbling
element.addEventListener('mouseleave', handler); // No bubbling
element.addEventListener('mouseover', handler); // Bubbles
element.addEventListener('mouseout', handler); // Bubbles

// Keyboard events
element.addEventListener('keydown', handler);
element.addEventListener('keyup', handler);
element.addEventListener('keypress', handler); // Deprecated

// Form events
element.addEventListener('submit', handler);
element.addEventListener('change', handler);
element.addEventListener('input', handler);
element.addEventListener('focus', handler);
element.addEventListener('blur', handler);

// Window events
window.addEventListener('load', handler);
window.addEventListener('DOMContentLoaded', handler);
window.addEventListener('resize', handler);
window.addEventListener('scroll', handler);

// Custom events
const event = new CustomEvent('myEvent', {
  detail: { data: 'value' }
});
element.dispatchEvent(event);
```

## 5. Performance Optimization

### Batch DOM Updates

```javascript
// ❌ Multiple reflows
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div); // Reflow each time
}

// ✅ Batch updates
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment); // Single reflow

// ✅ Or use display: none
container.style.display = 'none';
// Make changes
container.style.display = 'block';
```

### Debounce & Throttle

```javascript
// Debounce scroll
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

window.addEventListener('scroll', debounce(() => {
  console.log('Scrolled');
}, 100));

// Throttle resize
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

window.addEventListener('resize', throttle(() => {
  console.log('Resized');
}, 100));
```

### Virtual Scrolling

```javascript
// Only render visible items
function renderVisibleItems(container, items, itemHeight) {
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  
  const visibleItems = items.slice(startIndex, endIndex);
  // Render only visibleItems
}
```

## 6. Modern APIs

### Intersection Observer

```javascript
// Observe element visibility
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.5,
  rootMargin: '50px'
});

observer.observe(element);

// Lazy loading images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

### Mutation Observer

```javascript
// Observe DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      console.log('Children changed');
    }
    if (mutation.type === 'attributes') {
      console.log('Attribute changed:', mutation.attributeName);
    }
  });
});

observer.observe(element, {
  childList: true,
  attributes: true,
  subtree: true
});
```

## 7. Common Patterns

### Component-like Pattern

```javascript
function createButton(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

function createCard(title, content) {
  const card = document.createElement('div');
  card.className = 'card';
  
  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  
  const contentEl = document.createElement('p');
  contentEl.textContent = content;
  
  card.appendChild(titleEl);
  card.appendChild(contentEl);
  
  return card;
}
```

### Form Handling

```javascript
// Get form data
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  console.log(data);
  
  // Or manually
  const data = {
    name: form.querySelector('[name="name"]').value,
    email: form.querySelector('[name="email"]').value
  };
});
```

## 8. Common Pitfalls

```javascript
// ❌ Query before element exists
const element = document.querySelector('.not-yet-created');

// ✅ Wait for DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelector('.element');
});

// ❌ innerHTML với user input (XSS)
element.innerHTML = userInput; // Dangerous!

// ✅ Use textContent hoặc sanitize
element.textContent = userInput;

// ❌ Memory leaks - not removing listeners
element.addEventListener('click', handler);
// Element removed but listener still attached

// ✅ Remove listeners
element.removeEventListener('click', handler);
// Or use AbortController
const controller = new AbortController();
element.addEventListener('click', handler, {
  signal: controller.signal
});
controller.abort(); // Remove all listeners
```

## 9. Interview Questions

1. **querySelector vs getElementById?**
   - querySelector: flexible, returns first match, static
   - getElementById: faster, specific, returns element directly

2. **innerHTML vs textContent?**
   - innerHTML: parses HTML, XSS risk
   - textContent: plain text, safe, faster

3. **Event bubbling vs capturing?**
   - Bubbling: event propagates up (default)
   - Capturing: event propagates down

4. **Event delegation benefits?**
   - Performance: single listener
   - Dynamic content: works with new elements
   - Memory: fewer listeners

5. **DOM reflow vs repaint?**
   - Reflow: layout recalculation (expensive)
   - Repaint: visual update (cheaper)
   - Minimize reflows by batching updates

