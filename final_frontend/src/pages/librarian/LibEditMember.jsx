// LibEditMember: /librarian/members/edit/:id — GET + PUT /api/members/:id
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { U, docLoi } from '../../api/index.js';

/**
 * Sửa bạn đọc (`/librarian/members/edit/:id`).
 * GET một lần để đổ form; không có form đổi mật khẩu (dùng luồng auth/đổi MK của user nếu có).
 */
export default function LibEditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(''); // Read-only trên UI (mã cố định)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Hoạt động'); // PUT không gửi đổi mật khẩu ở form này

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(`${U.members}/${id}`);
        if (!r.ok) {
          alert('Không tìm thấy thông tin bạn đọc này!');
          navigate('/librarian/members');
          return;
        }
        const m = await r.json();
        setCode(m.code || '');
        setName(m.name || '');
        setEmail(m.email || '');
        setPhone(m.phone || '');
        setStatus(m.status || 'Hoạt động');
      } catch {
        alert('Lỗi lấy dữ liệu từ Server!');
      }
    })();
  }, [id, navigate]);

  /**
   * PUT `${U.members}/${id}` — body không chứa password.
   * @param {import('react').FormEvent} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    try {
      const r = await fetch(`${U.members}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, email, phone, status })
      });
      if (r.ok) {
        alert('Đã cập nhật thông tin thành công!');
        navigate('/librarian/members');
      } else alert((await docLoi(r)).message || 'Thao tác thất bại do lỗi từ hệ thống!');
    } catch {
      alert('Lỗi kết nối Server! Không thể lưu dữ liệu.');
    }
  }

  return (
    <div className="container admin-ui">
      <Link to="/librarian/members" className="btn-back">
        Quay lại
      </Link>
      <h1>Sửa thông tin bạn đọc</h1>
      <div className="form-container">
        <form id="form-member" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={id || ''} readOnly />
          <div className="form-group">
            <label>Mã bạn đọc</label>
            <input type="text" name="code" className="form-control" readOnly style={{ backgroundColor: '#f3f4f6' }} value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Họ tên</label>
            <input type="text" name="name" className="form-control" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" name="phone" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select name="status" className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Hoạt động">Hoạt động (Được phép mượn sách)</option>
              <option value="Bị khóa">Bị khóa (Vi phạm/Nợ sách)</option>
            </select>
          </div>
          <div className="form-actions" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="submit" className="btn">
              Cập nhật
            </button>
            <Link to="/librarian/members" className="btn" style={{ background: '#94a3b8', borderColor: '#94a3b8' }}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
