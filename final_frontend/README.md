# Library Management — Frontend (Vite + React)

Chỉ dùng SPA React (`npm run dev`). Các trang HTML/JS tĩnh cũ đã gỡ.

## Cấu trúc `src/`

- `api/index.js` — `apiUrl`, endpoint `U`, `jerr`, `d8`, và `getUser` / auth helpers (gộp một file)
- `assets/` — `member.css`, `librarian.css`, `extra-pages.css` (toàn bộ CSS phụ trang)
- `components/Layouts.jsx` — layout bạn đọc + thủ thư
- `pages/` — `auth`, `member`, `librarian`
- `App.jsx` — route + `ProtectedMember` / `ProtectedAdmin` (không tách file)
- `App.css`, `main.jsx`, `index.css`

## Chạy dự án

```bash
npm install
npm run dev
```

Backend mặc định: `[https://library-backend-api-3xcu.onrender.com](https://library-backend-api-3xcu.onrender.com)`. Đổi qua biến `VITE_API_BASE` trong `.env` (xem `.env.example`).

## Lint

```bash
npm run lint
```
