// File vào điểm: kết nối React với DOM (thẻ #root trong index.html)
import React from 'react';
// Thư viện React 18 — hàm createRoot thay cho ReactDOM.render cũ
import ReactDOM from 'react-dom/client';
// Cung cấp ngữ cảnh định tuyến cho toàn app (Route, Link, useNavigate)
import { BrowserRouter } from 'react-router-dom';
// File CSS áp cho toàn trang (font, reset, biến...)
import './index.css';
// Component gốc — khai báo mọi đường dẫn /member, /auth, /librarian
import App from './App.jsx';

// Lấy node DOM #root và gắn React tree vào đó
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode: bật kiểm tra thêm trong dev (ví dụ cảnh báo API lỗi thời)
  <React.StrictMode>
    {/* BrowserRouter bọc App để mọi component con dùng được router */}
    <BrowserRouter>
      {/* App render Routes — màn hình thay đổi theo URL */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
