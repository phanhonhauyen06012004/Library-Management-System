// LibBorrowings: /librarian/borrowings — GET phiếu, PUT return, DELETE
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { U, chiNgay } from '../../api/index.js';

/**
 * Danh sách phiếu mượn (`/librarian/borrowings`).
 * GET `U.borrowings` một lần; `filter` thu hẹp theo `status` hoặc `all`.
 * Theo từng `status`: hiển thị OTP (Đang mượn); nút Thu hồi; Xóa khi đã trả.
 * (Đã cập nhật: Bỏ trạng thái Chờ duyệt do hệ thống tự động duyệt khi mượn).
 */
export default function LibBorrowings() {
  const [filter, setFilter] = useState('all'); // 'all' | 'Đang mượn' | 'Đã trả'
  const [all, setAll] = useState([]); // Toàn bộ phiếu sau GET
  const [error, setError] = useState(false);

  /**
   * Tải lại toàn bộ phiếu (GET). Gọi sau mount và sau PUT/DELETE thành công để đồng bộ bảng.
   */
  async function load() {
    try {
      const list = await (await fetch(U.borrowings)).json();
      // Lọc bỏ các phiếu "Chờ duyệt" hoặc "Từ chối" cũ (nếu còn sót lại trong DB) để tránh rác giao diện
      const cleanedList = Array.isArray(list) 
        ? list.filter(b => b.status === 'Đang mượn' || b.status === 'Đã trả') 
        : [];
      setAll(cleanedList);
      setError(false);
    } catch {
      setError(true);
      setAll([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const data = filter === 'all' ? all : all.filter((b) => b.status === filter);

  /**
   * Gọi workflow thủ thư: `PUT ${U.borrowings}/${id}/return`.
   * @param {string|number} id - Mã phiếu
   */
  async function handleReturn(id) {
    if (!window.confirm(`Xác nhận thu hồi sách cho phiếu #${id}?`)) return;
    try {
      // Gọi API trả sách (nhớ kiểm tra Backend xem action là 'return' hay 'returned' nhé)
      const r = await fetch(`${U.borrowings}/${id}/return`, { method: 'PUT' });
      if (r.ok) await load();
      else alert('Lỗi thực hiện thao tác thu hồi!');
    } catch {
      alert('Lỗi kết nối Server!');
    }
  }

  /**
   * DELETE phiếu (thường dùng khi trạng thái đã trả). Có `confirm` trước khi gọi API.
   * @param {string|number} id
   */
  async function deleteBorrowing(id) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn phiếu #${id}?`)) return;
    try {
      const r = await fetch(`${U.borrowings}/${id}`, { method: 'DELETE' });
      if (r.ok) await load();
      else alert('Lỗi khi xóa!');
    } catch {
      alert('Lỗi kết nối Server!');
    }
  }

  return (
    <div className="container admin-ui">
      <Link to="/librarian" className="btn-back" style={{ display: 'inline-block', marginBottom: '15px' }}>
        Quay lại
      </Link>
      <h1 style={{ marginBottom: 25, color: '#1e293b', letterSpacing: '-0.5px' }}>Quản lý phiếu mượn</h1>
      <div style={{ marginBottom: 20, background: '#f8fafc', padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 15, border: '1px solid #edf2f7' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Lọc theo:</span>
        <select
          id="filter-status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '8px 15px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', color: '#475569' }}
        >
          <option value="all">Tất cả phiếu</option>
          <option value="Đang mượn">Đang mượn</option>
          <option value="Đã trả">Đã trả</option>
        </select>
      </div>

      <table className="admin-table" id="borrowings-table">
        <thead>
          <tr>
            <th width="5%">ID</th>
            <th width="25%">Bạn đọc</th>
            <th width="25%">Tên sách</th>
            <th width="12%">Ngày mượn</th>
            <th width="12%">Hạn trả</th>
            <th width="10%">Trạng thái</th>
            <th width="11%" style={{ textAlign: 'right' }}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
                Lỗi kết nối Server!
              </td>
            </tr>
          )}
          {!error && !data.length && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                Không có dữ liệu phù hợp.
              </td>
            </tr>
          )}
          {!error &&
            data.map((br) => {
              let act = '';
              let stc = '';
              let otp = '';
              
              if (br.status === 'Đang mượn') {
                otp = (
                  <>
                    <br />
                    <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 'bold' }}>OTP: {br.verification_code || br.otp || '---'}</span>
                  </>
                );
                stc = 'status-borrowing'; // Xanh dương
                act = (
                  <button type="button" onClick={() => handleReturn(br.id)} className="btn-ghost btn-return" style={{ border: '1px solid #94a3b8', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                    Thu hồi
                  </button>
                );
              } else if (br.status === 'Đã trả') {
                stc = 'status-active'; // Xanh lá
                act = (
                  <button type="button" onClick={() => deleteBorrowing(br.id)} className="btn-delete" style={{ border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', background: '#ef4444', color: 'white' }}>
                    Xóa
                  </button>
                );
              }

              return (
                <tr key={br.id}>
                  <td style={{ color: '#94a3b8' }}>
                    #{br.id}
                    {otp}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#334155' }}>{br.member_name || ''}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{br.member_code || ''}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{br.book_title || ''}</td>
                  <td style={{ fontSize: '0.9rem' }}>{chiNgay(br.borrow_date)}</td>
                  <td style={{ fontSize: '0.9rem' }}>{chiNgay(br.due_date)}</td>
                  <td>
                    <span className={`status-badge ${stc}`}>{br.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group">{act}</div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}