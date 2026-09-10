// LibAddMember: /librarian/members/add — POST /api/members
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { U, docLoi } from '../../api/index.js';

/**
 * Thêm bạn đọc (`/librarian/members/add`).
 * POST gửi `password` để tạo tài khoản đăng nhập; `status` chọn Hoạt động / Bị khóa.
 */
export default function LibAddMember() {
  const navigate = useNavigate();
  const [code, setCode] = useState(''); // Mã hiển thị (mã bạn đọc)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // Bắt buộc — tài khoản đăng nhập lần đầu
  const [status, setStatus] = useState('Hoạt động'); // Hoạt động | Bị khóa

  /**
   * Validate password không rỗng rồi POST `U.members`.
   * @param {import('react').FormEvent} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    if (!password) return alert('Vui lòng nhập mật khẩu cho thành viên mới!');
    try {
      const r = await fetch(U.members, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, email, phone, status, password })
      });
      if (r.ok) {
        alert('Đã thêm bạn đọc mới thành công!');
        navigate('/librarian/members');
      } else alert((await docLoi(r)).message || 'Thao tác thất bại do lỗi từ hệ thống!');
    } catch {
      alert('Lỗi kết nối Server! Không thể lưu dữ liệu.');
    }
  }

  return (
    <div className="container">
      <Link to="/librarian/members" className="btn-back">
        Quay lại
      </Link>
      <h1>Thêm bạn đọc</h1>
      <form id="form-member" onSubmit={onSubmit}>
        <label>Mã bạn đọc</label>
        <input type="text" name="code" required value={code} onChange={(e) => setCode(e.target.value)} />
        <label>Họ tên</label>
        <input type="text" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email</label>
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Số điện thoại</label>
        <input type="tel" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>Mật khẩu đăng nhập</label>
        <input type="password" name="password" placeholder="Nhập mật khẩu mặc định..." required value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Trạng thái</label>
        <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Hoạt động">Hoạt động (được phép mượn sách)</option>
          <option value="Bị khóa">Bị khóa (không được mượn, ví dụ nợ sách, vi phạm)</option>
        </select>
        <button type="submit" className="btn">
          Lưu
        </button>
        <Link to="/librarian/members" className="btn">
          Hủy
        </Link>
      </form>
    </div>
  );
}
