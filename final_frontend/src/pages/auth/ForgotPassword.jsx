import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../api/index.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState(''); // Email để nhận OTP
  const [step, setStep] = useState(1); // 1 = nhập email, 2 = OTP+MK, 3 = xong
  const [otp, setOtp] = useState(''); // Mã OTP user nhập
  const [newPassword, setNewPassword] = useState(''); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(''); // Nhập lại MK mới
  const [msg, setMsg] = useState({ text: '', color: '' }); // Thông báo + màu chữ

  async function getOtp() {
    if (!email.trim()) return alert('Vui lòng nhập Email!'); // Chặn email rỗng
    setMsg({ text: 'Đang gửi mã về Email... Vui lòng đợi!', color: '#2563eb' }); // Đang xử lý
    try {
      const res = await fetch(apiUrl('auth/forgot-password'), {
        method: 'POST', // Backend tạo OTP và gửi mail (nếu cấu hình)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json(); // Đọc message từ server
      if (res.ok) setStep(2); // Thành công → sang bước nhập OTP
      setMsg({ text: data.message, color: res.ok ? '#16a34a' : '#dc2626' }); // Màu xanh/đỏ
    } catch {
      setMsg({ text: 'Lỗi kết nối Server!', color: '#dc2626' }); // Lỗi mạng
    }
  }

  async function resetPw() {
    if (newPassword !== confirmPassword) {
      setMsg({ text: 'Mật khẩu xác nhận không khớp!', color: '#dc2626' }); // Hai ô MK khác nhau
      return;
    }
    try {
      const res = await fetch(apiUrl('auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword })
      });
      const data = await res.json();
      setMsg({ text: data.message, color: res.ok ? '#16a34a' : '#dc2626' });
      if (res.ok) setStep(3); // Thành công → màn hình cảm ơn
    } catch {
      setMsg({ text: 'Lỗi kết nối Server!', color: '#dc2626' });
    }
  }

  return (
    <div className="login-page" style={{ minHeight: '100vh' }}>
      <div className="login-box">
        <h1>Khôi phục mật khẩu</h1>
        {step === 3 && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ color: msg.color || '#16a34a', fontWeight: 'bold' }}>{msg.text}</p>
            <Link to="/auth/login" style={{ color: '#64748b', fontSize: '0.9rem' }}>
              &larr; Quay lại đăng nhập
            </Link>
          </div>
        )}
        {step === 1 && (
          <div id="step-1">
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>Nhập Email để nhận mã OTP.</p>
            <div className="form-group">
              <label>Email đã đăng ký</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="button" id="btn-get-otp" className="btn" style={{ marginTop: '10px' }} onClick={getOtp}>
              Nhận mã OTP
            </button>
          </div>
        )}
        {step === 2 && (
          <div id="step-2" style={{ marginTop: '15px' }}>
            <div className="form-group">
              <label>Mã OTP (Đã gửi vào Email)</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập 6 số..." required />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới (&gt;6 ký tự, 1 Hoa, 1 Số)</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="button" id="btn-reset" className="btn" style={{ marginTop: '10px' }} onClick={resetPw}>
              Đổi mật khẩu
            </button>
          </div>
        )}
        {step !== 3 && msg.text && (
          <p id="msg-box" style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold', color: msg.color }}>
            {msg.text}
          </p>
        )}
        {step !== 3 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/auth/login" style={{ color: '#64748b', fontSize: '0.9rem' }}>
              &larr; Quay lại đăng nhập
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
