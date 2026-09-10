import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../api/index.js';

export default function ChangePassword() {
  const [email, setEmail] = useState(''); // Email tài khoản
  const [oldPassword, setOldPassword] = useState(''); // Mật khẩu cũ (xác minh)
  const [newPassword, setNewPassword] = useState(''); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(''); // Gõ lại MK mới
  const [msg, setMsg] = useState({ text: '', color: '', show: false }); // show: có hiện dòng thông báo

  async function onSubmit(e) {
    e.preventDefault(); // Không reload trang
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{7,}$/; // Ít nhất 7 ký tự, 1 hoa, 1 số
    if (!passRegex.test(newPassword)) {
      setMsg({ show: true, color: '#dc2626', text: 'Mật khẩu phải > 6 ký tự, có ít nhất 1 chữ hoa và 1 số!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ show: true, color: '#dc2626', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    try {
      const response = await fetch(apiUrl('auth/change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), oldPassword, newPassword })
      });
      const data = await response.json();
      setMsg({ show: true, color: response.ok ? '#16a34a' : '#dc2626', text: data.message });
      if (response.ok) {
        setEmail(''); // Xóa form khi thành công
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setMsg({ show: true, color: '#dc2626', text: 'Lỗi kết nối Server!' });
    }
  }

  return (
    <div className="login-page" style={{ minHeight: '100vh' }}>
      <div className="login-box">
        <h1>Đổi mật khẩu</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Nhập mật khẩu hiện tại để đổi sang mật khẩu mới.
        </p>
        <form id="change-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Tài khoản (Email)</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email của bạn..."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="old-password">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="old-password"
              placeholder="••••••••"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">Mật khẩu mới</label>
            <input
              type="password"
              id="new-password"
              placeholder="••••••••"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn" style={{ marginTop: '10px' }}>
            Cập nhật mật khẩu
          </button>
        </form>
        {msg.show && (
          <p id="msg-box" style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold', color: msg.color }}>
            {msg.text}
          </p>
        )}
        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/auth/login" style={{ color: '#64748b', fontSize: '0.9rem' }}>
            &larr; Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
