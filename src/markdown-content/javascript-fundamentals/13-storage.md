# Storage (LocalStorage, SessionStorage, Cookie)

## 1. LocalStorage

### Các thao tác cơ bản

```javascript
// Lưu dữ liệu
localStorage.setItem('key', 'value');
localStorage.setItem('user', JSON.stringify({ name: 'John', age: 30 }));

// Lấy dữ liệu
const value = localStorage.getItem('key');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Xóa một item
localStorage.removeItem('key');

// Xóa tất cả
localStorage.clear();

// Lấy key theo index
const key = localStorage.key(0);

// Lấy số lượng item
const length = localStorage.length;

// Duyệt qua tất cả
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(key, value);
}

// Truy cập như object (không khuyến khích)
localStorage.key = 'value';
const value = localStorage.key;
delete localStorage.key;
```

### Đặc điểm

```javascript
// - Dữ liệu tồn tại qua các phiên trình duyệt (đóng/mở lại vẫn còn)
// - Chia sẻ giữa các tab/cửa sổ cùng origin
// - Giới hạn ~5-10MB (tùy trình duyệt)
// - API đồng bộ (synchronous)
// - Chỉ lưu được string
// - Tuân theo same-origin policy
// - Không tự động hết hạn
```

### Ví dụ thực tế

```javascript
// Lưu cài đặt người dùng
class UserPreferences {
  static save(settings) {
    localStorage.setItem('preferences', JSON.stringify(settings));
  }

  static load() {
    const stored = localStorage.getItem('preferences');
    return stored ? JSON.parse(stored) : {};
  }

  static get(key) {
    const prefs = this.load();
    return prefs[key];
  }

  static set(key, value) {
    const prefs = this.load();
    prefs[key] = value;
    this.save(prefs);
  }
}

// Sử dụng
UserPreferences.set('theme', 'dark');
UserPreferences.set('language', 'vi');
const theme = UserPreferences.get('theme');

// Cache dữ liệu API
async function fetchWithCache(url) {
  const cacheKey = `cache_${url}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Cache có hiệu lực trong 5 phút
    if (age < 5 * 60 * 1000) {
      return data;
    }
  }

  const response = await fetch(url);
  const data = await response.json();

  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));

  return data;
}

// Lưu dữ liệu form
function saveFormData(formId, data) {
  localStorage.setItem(`form_${formId}`, JSON.stringify(data));
}

function loadFormData(formId) {
  const stored = localStorage.getItem(`form_${formId}`);
  return stored ? JSON.parse(stored) : null;
}

// Tự động lưu form khi nhập
const form = document.querySelector('#myForm');
form.addEventListener('input', (e) => {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  saveFormData('myForm', data);
});

// Khôi phục khi load trang
window.addEventListener('DOMContentLoaded', () => {
  const saved = loadFormData('myForm');
  if (saved) {
    Object.keys(saved).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = saved[key];
    });
  }
});
```

## 2. SessionStorage

### Các thao tác cơ bản

```javascript
// API giống hệt localStorage
sessionStorage.setItem('key', 'value');
const value = sessionStorage.getItem('key');
sessionStorage.removeItem('key');
sessionStorage.clear();

// Đặc điểm:
// - Chỉ tồn tại trong phiên làm việc (session)
// - Bị xóa khi đóng tab/cửa sổ
// - KHÔNG chia sẻ giữa các tab (mỗi tab riêng biệt)
// - Giới hạn dung lượng như localStorage
// - Tuân theo same-origin policy
```

### Các trường hợp sử dụng

```javascript
// Lưu tạm dữ liệu form (mất khi đóng tab)
sessionStorage.setItem('draft', JSON.stringify(formData));

// Form nhiều bước
sessionStorage.setItem('step1', JSON.stringify(step1Data));
sessionStorage.setItem('step2', JSON.stringify(step2Data));

// Dữ liệu riêng cho từng tab
sessionStorage.setItem('tabId', generateId());

// Token tạm thời cho phiên làm việc
sessionStorage.setItem('sessionToken', token);
```

## 3. Cookie

### Các thao tác cơ bản

```javascript
// Đặt cookie
document.cookie = 'name=value';
document.cookie = 'name=value; expires=Thu, 18 Dec 2025 12:00:00 UTC';
document.cookie = 'name=value; path=/';
document.cookie = 'name=value; domain=.example.com';
document.cookie = 'name=value; secure'; // Chỉ gửi qua HTTPS
document.cookie = 'name=value; samesite=strict';

// Đọc cookie
const cookies = document.cookie; // "name1=value1; name2=value2"
const cookieValue = getCookie('name');

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Xóa cookie (đặt ngày hết hạn trong quá khứ)
document.cookie = 'name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Các hàm helper cho cookie
const Cookie = {
  set(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  },

  remove(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },

  getAll() {
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
    return cookies;
  }
};
```

### Các thuộc tính Cookie

```javascript
// expires - ngày hết hạn cụ thể
document.cookie = 'name=value; expires=Thu, 18 Dec 2025 12:00:00 UTC';

// max-age - thời gian sống tính bằng giây
document.cookie = 'name=value; max-age=3600'; // 1 giờ

// path - đường dẫn áp dụng
document.cookie = 'name=value; path=/'; // Toàn bộ site
document.cookie = 'name=value; path=/admin'; // Chỉ trong /admin

// domain - tên miền áp dụng
document.cookie = 'name=value; domain=.example.com'; // Tất cả subdomain

// secure - chỉ gửi qua HTTPS
document.cookie = 'name=value; secure';

// samesite - bảo vệ CSRF
document.cookie = 'name=value; samesite=strict'; // Không gửi cross-site
document.cookie = 'name=value; samesite=lax'; // Một số trường hợp cross-site
document.cookie = 'name=value; samesite=none; secure'; // Cho phép cross-site (bắt buộc secure)
```

### Đặc điểm

```javascript
// - Được gửi kèm MỌI request HTTP đến server
// - Giới hạn ~4KB
// - Có thể được set từ server (Set-Cookie header)
// - Server có thể đọc được
// - Có thể tự động hết hạn
// - Phạm vi theo domain/path
// - Có thể httpOnly (JavaScript không truy cập được)
```

## 4. So sánh

| Đặc điểm | LocalStorage | SessionStorage | Cookie |
|----------|-------------|----------------|--------|
| Dung lượng | ~5-10MB | ~5-10MB | ~4KB |
| Hết hạn | Thủ công | Đóng tab | Tùy chỉnh |
| Server truy cập | Không | Không | Có |
| Gửi kèm request | Không | Không | Có |
| Phạm vi | Origin | Tab | Domain/Path |
| API | Đơn giản | Đơn giản | Chuỗi ký tự |

## 5. Best Practices

### Xử lý lỗi

```javascript
// localStorage/sessionStorage có thể throw error
function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('Vượt quá dung lượng cho phép');
      // Xóa dữ liệu cũ hoặc thông báo người dùng
    }
    return false;
  }
}

function safeGetStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Lỗi khi đọc storage:', e);
    return null;
  }
}
```

### Storage Wrapper (Đóng gói Storage)

```javascript
class Storage {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  set(key, value, ttl = null) {
    const item = {
      value,
      timestamp: Date.now()
    };

    if (ttl) {
      item.expires = Date.now() + ttl;
    }

    try {
      this.storage.setItem(key, JSON.stringify(item));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        this.clearExpired();
        this.storage.setItem(key, JSON.stringify(item));
      } else {
        throw e;
      }
    }
  }

  get(key) {
    try {
      const item = this.storage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      if (parsed.expires && Date.now() > parsed.expires) {
        this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (e) {
      return null;
    }
  }

  remove(key) {
    this.storage.removeItem(key);
  }

  clear() {
    this.storage.clear();
  }

  clearExpired() {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      const item = this.storage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          if (parsed.expires && Date.now() > parsed.expires) {
            this.remove(key);
          }
        } catch (e) {
          // Item không hợp lệ, xóa đi
          this.remove(key);
        }
      }
    });
  }
}

// Sử dụng
const storage = new Storage(localStorage);
storage.set('user', { name: 'John' }, 60 * 60 * 1000); // TTL 1 giờ
const user = storage.get('user');
```

### Bảo mật

```javascript
// ❌ KHÔNG lưu dữ liệu nhạy cảm
localStorage.setItem('password', password); // Sai!

// ✅ Mã hóa dữ liệu nhạy cảm
function encrypt(data, key) {
  // Sử dụng crypto API hoặc thư viện
  return encryptedData;
}

const encrypted = encrypt(sensitiveData, secretKey);
localStorage.setItem('data', encrypted);

// ❌ XSS có thể truy cập localStorage
// Luôn sanitize input từ người dùng

// ✅ Dùng HttpOnly cookie cho token nhạy cảm
// Set từ server: Set-Cookie: token=xxx; HttpOnly; Secure

// ✅ Dùng SameSite cho cookie
document.cookie = 'session=xxx; SameSite=Strict; Secure';
```

## 6. Các Pattern phổ biến

### Lưu trữ State

```javascript
// Lưu state Redux/Vuex
function persistState(state) {
  localStorage.setItem('appState', JSON.stringify(state));
}

function loadState() {
  const stored = localStorage.getItem('appState');
  return stored ? JSON.parse(stored) : undefined;
}

// React hook lưu state
function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
```

### Quản lý Cache

```javascript
class CacheManager {
  constructor(prefix = 'cache_', ttl = 3600000) {
    this.prefix = prefix;
    this.ttl = ttl; // Mặc định 1 giờ
  }

  set(key, value) {
    const item = {
      value,
      timestamp: Date.now()
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  get(key) {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    const age = Date.now() - parsed.timestamp;

    if (age > this.ttl) {
      this.remove(key);
      return null;
    }

    return parsed.value;
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}
```

## 7. Câu hỏi phỏng vấn

1. **LocalStorage vs SessionStorage?**
   - LocalStorage: tồn tại vĩnh viễn, chia sẻ giữa các tab
   - SessionStorage: chỉ trong phiên, riêng biệt mỗi tab

2. **Cookie vs LocalStorage?**
   - Cookie: gửi đến server, giới hạn 4KB, có thể hết hạn
   - LocalStorage: chỉ client, dung lượng lớn hơn, tự quản lý hết hạn

3. **Giới hạn dung lượng?**
   - LocalStorage/SessionStorage: ~5-10MB
   - Cookie: ~4KB mỗi cookie, ~20 cookie mỗi domain

4. **Xử lý khi vượt quá dung lượng?**
   - Bắt QuotaExceededError, xóa dữ liệu cũ, thông báo người dùng

5. **Vấn đề bảo mật?**
   - XSS có thể truy cập storage, không lưu dữ liệu nhạy cảm, dùng HttpOnly cookie cho token

6. **Khi nào dùng loại nào?**
   - LocalStorage: cài đặt người dùng, cache
   - SessionStorage: dữ liệu tạm, form nhiều bước
   - Cookie: token xác thực, dữ liệu cần gửi đến server
