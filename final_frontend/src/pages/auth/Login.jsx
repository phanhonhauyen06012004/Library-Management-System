// Hook lưu state (ô nhập, lỗi) — mỗi setState khiến component render lại
import { useState } from 'react';
// Link: điều hướng SPA; useNavigate: đổi route sau login
import { Link, useNavigate } from 'react-router-dom';
// Ghép URL API auth/login
import { apiUrl } from '../../api/index.js';

export default function Login() {
  const navigate = useNavigate(); // Hàm chuyển đến /member hoặc /librarian
  const [email, setEmail] = useState(''); // Chuỗi email đang nhập
  const [password, setPassword] = useState(''); // Chuỗi mật khẩu
  const [err, setErr] = useState(''); // Thông báo lỗi hiển thị dưới form

  async function onSubmit(e) {
    e.preventDefault(); // Không gửi form kiểu HTML (tránh reload trang)
    setErr(''); // Xóa lỗi cũ
    try {
      const response = await fetch(apiUrl('auth/login'), {
        method: 'POST', // Backend nhận JSON đăng nhập
        headers: { 'Content-Type': 'application/json' }, // Body là JSON
        body: JSON.stringify({ email: email.trim(), password }) // Trim email tránh khoảng trắng
      });
      const data = await response.json(); // Parse JSON phản hồi
      if (!response.ok) {
        setErr(data.message || 'Lỗi đăng nhập'); // HTTP lỗi → hiện message server
        return;
      }
      localStorage.setItem('token', data.token); // JWT cho header Authorization
      localStorage.setItem('user', JSON.stringify(data.user)); // Thông tin hiển thị + role
      if (data.user.role === 'admin') navigate('/librarian', { replace: true }); // Thủ thư
      else navigate('/member', { replace: true }); // Bạn đọc
    } catch {
      setErr('Lỗi kết nối Server! Backend có thể đang tắt.'); // Mạng / server down
    }
  }

  return (
    <div className="login-page" style={{ margin: 0, minHeight: '100vh' }}>
      {/* Hộp chứa form trắng giữa màn */}
      <div className="login-box">
        <h1>Library Management</h1>
        <form id="login-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email..."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="login-links">
            <Link to="/auth/forgot-password">Quên mật khẩu?</Link>
            <Link to="/auth/change-password">Đổi mật khẩu</Link>
          </div>
          <button type="submit" className="btn" style={{ marginTop: '15px' }}>
            Đăng nhập
          </button>
        </form>
        {err && (
          <p id="login-error" style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {err}
          </p>
        )}
      </div>
    </div>
  );
}
