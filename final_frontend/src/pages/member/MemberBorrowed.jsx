import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { U, chiNgay, getUser, homNay } from '../../api/index.js';

/**
 * Lịch sử / phiếu mượn của member (`/member/borrowed`).
 *
 * API: `GET ${U.borrowings}/user/${u.id}` — 404 được coi là “chưa có phiếu” → `rows = []`.
 * State `rows`: `null` đang tải; `[]` không có dữ liệu; mảng có phần tử là danh sách phiếu.
 *
 * Cột trạng thái (logic hiển thị):
 * - `Chờ duyệt` → class cảnh báo.
 * - `Đang mượn` → class đang mượn; nếu `chiNgay(due_date) < homNay()` thì đổi nhãn thành “Quá hạn” và class khóa.
 * - `Từ chối` → class khóa.
 * - Ngày hiển thị qua `chiNgay()` để đồng nhất định dạng.
 */
export default function MemberBorrowed() {
  const navigate = useNavigate(); // Chuyển sang login nếu chưa đăng nhập
  const [rows, setRows] = useState(null); // null = đang load; [] = không có phiếu; [...] = có dữ liệu
  const [error, setError] = useState(false); // true = lỗi fetch

  useEffect(() => {
    const u = getUser(); // Lấy member đã đăng nhập
    if (!u) {
      navigate('/auth/login', { replace: true }); // Chưa login → login
      return;
    }
    (async () => {
      try {
        const response = await fetch(`${U.borrowings}/user/${u.id}`); // API phiếu theo member
        if (response.status === 404) {
          setRows([]); // Không có phiếu → mảng rỗng
          return;
        }
        if (!response.ok) throw new Error('fail'); // 4xx/5xx khác 404
        setRows(await response.json()); // Gán mảng phiếu
        setError(false);
      } catch {
        setError(true); // Lỗi mạng hoặc parse
        setRows(null);
      }
    })();
  }, [navigate]);

  const today = homNay(); // Chuỗi ngày hôm nay YYYY-MM-DD

  let tbody; // Nội dung <tbody> — một trong các nhánh
  if (error) {
    tbody = (
      <tr>
        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#ef4444' }}>
          Lỗi kết nối Server! Vui lòng kiểm tra lại Backend.
        </td>
      </tr>
    );
  } else if (rows === null) {
    tbody = (
      <tr>
        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
          Đang tải dữ liệu từ Server...
        </td>
      </tr>
    );
  } else if (!rows.length) {
    tbody = (
      <tr>
        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
          Bạn chưa có lịch sử mượn sách nào.
        </td>
      </tr>
    );
  } else {
    tbody = rows.map((br) => {
      let status = br.status || 'Chờ duyệt'; // Mặc định nếu thiếu
      let statusClass = 'status-active'; // Class CSS badge
      if (status === 'Chờ duyệt') statusClass = 'status-warning';
      else if (status === 'Đang mượn') statusClass = 'status-borrowing';
      // Từ chối: khóa. Đang mượn nhưng quá hạn so với today: đổi nhãn "Quá hạn" + khóa
      else if (status === 'Từ chối' || (status === 'Đang mượn' && br.due_date && chiNgay(br.due_date) < today)) {
        if (status === 'Đang mượn') status = 'Quá hạn';
        statusClass = 'status-locked';
      }
      return (
        <tr key={br.id}>
          <td style={{ color: '#64748b', fontWeight: 500 }}>#{br.id}</td>
          <td style={{ fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>{br.book_title || 'Sách không xác định'}</td>
          <td style={{ color: '#334155' }}>{chiNgay(br.borrow_date)}</td>
          <td style={{ color: '#334155' }}>{chiNgay(br.due_date)}</td>
          <td>
            <span className={`status-badge ${statusClass}`}>{status}</span>
          </td>
          <td style={{ color: '#64748b' }}>
            #{br.id} <br /> <small>Mã xác nhận: <b>{br.verification_code || '---'}</b></small>
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="container user-ui">
      {/* Nút quay + tiêu đề + bảng (tbody đã gán ở biến tbody) */}
      <Link to="/member" className="btn-back">
        Quay lại
      </Link>
      <h1 style={{ marginBottom: '8px', color: '#0f172a' }}>Lịch sử mượn sách</h1>
      <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '1.05rem' }}>
        Danh sách các cuốn sách bạn đã và đang mượn tại thư viện.
      </p>

      <table className="borrow-table" id="borrowed-table">
        <thead>
          <tr>
            <th>Mã phiếu</th>
            <th>Tên sách</th>
            <th>Ngày mượn</th>
            <th>Hạn trả</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>{tbody}</tbody>
      </table>
    </div>
  );
}
