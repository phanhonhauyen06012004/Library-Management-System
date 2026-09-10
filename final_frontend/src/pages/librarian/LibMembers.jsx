// LibMembers: /librarian/members — GET /api/members, DELETE /api/members/:id
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { U, docLoi } from '../../api/index.js';

/**
 * Quản lý bạn đọc (`/librarian/members`).
 * Lọc client trên `name`, `email`, `code`. Trạng thái hiển thị badge Hoạt động / Bị khóa.
 * Mỗi dòng: link Sửa, nút Xóa gọi `deleteMember`.
 */
export default function LibMembers() {
  const [kw, setKw] = useState(''); // Từ khóa tìm tên / email / mã
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /**
   * GET `U.members`. `loading` bật đầu hàm, tắt trong `finally` để luôn kết thúc spinner.
   */
  async function load() {
    setLoading(true);
    try {
      const a = await (await fetch(U.members)).json();
      setMembers(Array.isArray(a) ? a : []);
      setError(false);
    } catch {
      setError(true);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const k = kw.toLowerCase().trim();
  const visible = k
    ? members.filter((m) => [m.name, m.email, m.code].some((t) => (t || '').toLowerCase().includes(k)))
    : members;

  /**
   * DELETE `${U.members}/${id}`. Thành công → `load()` để cập nhật bảng.
   * @param {string|number} id
   */
  async function deleteMember(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bạn đọc này không? Dữ liệu không thể khôi phục.')) return;
    try {
      const r = await fetch(`${U.members}/${id}`, { method: 'DELETE' });
      if (r.ok) {
        alert('Đã xóa thành công!');
        load();
      } else alert((await docLoi(r)).message || 'Có lỗi xảy ra khi xóa!');
    } catch {
      alert('Lỗi kết nối Server!');
    }
  }

  return (
    <div className="container">
      <Link to="/librarian" className="btn-back">
        Quay lại
      </Link>
      <h1>Quản lý bạn đọc</h1>
      <div className="books-toolbar">
        <Link to="/librarian/members/add" className="btn">
          Thêm bạn đọc
        </Link>
        <div className="book-search-wrap">
          <input
            type="text"
            id="member-search"
            className="book-search-input"
            placeholder="Tìm theo tên hoặc email..."
            autoComplete="off"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
          />
        </div>
      </div>
      <table id="members-table">
        <thead>
          <tr>
            <th>Mã bạn đọc</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: 'red', padding: 15 }}>
                Lỗi kết nối đến Server (Backend có thể đang tắt)!
              </td>
            </tr>
          )}
          {!error && loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 15 }}>
                Đang tải...
              </td>
            </tr>
          )}
          {!error && !loading && !visible.length && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 15 }}>
                {k ? 'Không tìm thấy bạn đọc phù hợp.' : 'Chưa có dữ liệu.'}
              </td>
            </tr>
          )}
          {!error &&
            visible.map((m) => (
              <tr key={m.id}>
                <td>{m.code || ''}</td>
                <td>{m.name || ''}</td>
                <td>{m.email || ''}</td>
                <td>{m.phone || ''}</td>
                <td>
                  <span className={`status-badge ${m.status === 'Bị khóa' ? 'status-locked' : 'status-active'}`}>{m.status}</span>
                </td>
                <td style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {/* NÚT CHI TIẾT MỚI ĐƯỢC THÊM VÀO ĐÂY */}
                  <Link 
                    to={`/librarian/members/${m.id}`} 
                    className="btn"
                    style={{ 
                      backgroundColor: '#10b981', 
                      borderColor: '#10b981', 
                      color: 'white' 
                    }}
                  >
                    Chi tiết
                  </Link>

                  <Link to={`/librarian/members/edit/${m.id}`} className="btn">
                    Sửa
                  </Link>
                  
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    style={{ cursor: 'pointer', border: 'none', padding: '5px 10px', borderRadius: 4, color: 'white' }} 
                    onClick={() => deleteMember(m.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}