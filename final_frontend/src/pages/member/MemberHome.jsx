// Hook: useEffect chạy sau render; useState lưu số hiển thị trên thẻ thống kê
import { useEffect, useState } from 'react';
// Link điều hướng; useNavigate chuyển trang nếu chưa login
import { Link, useNavigate } from 'react-router-dom';
// U.books, U.borrowings: URL API; getUser đọc user từ localStorage
import { U, getUser } from '../../api/index.js';

/**
 * Trang chủ khu vực member (`/member`).
 *
 * Hành vi:
 * - Nếu `getUser()` trả về null → `navigate('/auth/login')` (replace), không gọi API.
 * - GET `U.books`: lấy mảng sách, hiển thị `length` trên thẻ “Tổng số sách” (toàn thư viện).
 * - GET `U.borrowings`: danh sách phiếu (cùng endpoint list); lọc phía client các phiếu có
 *   `member_id === u.id` và `status` ∈ { 'Đang mượn', 'Chờ duyệt' } để đếm “Sách đang mượn” (nhãn thống kê).
 * - Lỗi mạng/JSON: gán chuỗi `'Lỗi'` vào state tương ứng (không throw).
 *
 * State `totalBooks` / `totalBorrowed`: hiển thị số dạng chuỗi, hoặc `'--'` ban đầu, hoặc `'Lỗi'`.
 */
export default function MemberHome() {
  const navigate = useNavigate(); // Hàm đổi URL
  const [totalBooks, setTotalBooks] = useState('--'); // Hiển thị số hoặc '--' hoặc 'Lỗi'
  const [totalBorrowed, setTotalBorrowed] = useState('--'); // Số phiếu Đang mượn + Chờ duyệt

  useEffect(() => {
    const u = getUser(); // User hiện tại hoặc null
    if (!u) {
      navigate('/auth/login', { replace: true }); // Bắt buộc đăng nhập
      return; // Không gọi API
    }
    (async () => {
      try {
        const r = await fetch(U.books); // GET danh sách sách
        if (r.ok) setTotalBooks(String((await r.json()).length)); // .length = tổng cuốn
      } catch {
        setTotalBooks('Lỗi'); // Backend lỗi / mạng
      }
      try {
        const r = await fetch(U.borrowings); // GET tất cả phiếu (admin cũng cùng API list)
        if (r.ok) {
          const a = await r.json(); // Mảng phiếu
          const n = a.filter(
            (b) => b.member_id === u.id && (b.status === 'Đang mượn' || b.status === 'Chờ duyệt')
          ).length; // Đếm phiếu của đúng member
          setTotalBorrowed(String(n));
        }
      } catch {
        setTotalBorrowed('Lỗi');
      }
    })();
  }, [navigate]);

  const displayUser = getUser() || {}; // Object rỗng nếu null — tránh lỗi .name

  return (
    <div className="container">
      {/* Chào hội viên + mô tả ngắn */}
      <h1>Trang chủ</h1>
      <p className="home-welcome" id="home-welcome">
        Welcome, {displayUser.name || '...'}!
      </p>
      <p className="reports-subtitle">
        Chào mừng bạn đến với thư viện. Sử dụng menu bên trái để xem sách và phiếu mượn của bạn.
      </p>

      {/* Hai thẻ: tổng sách toàn thư viện + số phiếu liên quan tài khoản (đang mượn / chờ duyệt) */}
      <div className="reports-row reports-row2 home-stats" style={{ marginBottom: '1.5rem' }}>
        <div className="report-card card-books">
          <span className="report-icon" aria-hidden="true">
            📚
          </span>
          <div className="report-card-inner">
            <span className="label">Tổng số sách</span>
            <span className="value" id="total-books">
              {totalBooks}
            </span>
          </div>
        </div>
        <div className="report-card card-borrowings">
          <span className="report-icon" aria-hidden="true">
            📖
          </span>
          <div className="report-card-inner">
            <span className="label">Sách đang mượn</span>
            <span className="value" id="total-borrowed">
              {totalBorrowed}
            </span>
          </div>
        </div>
      </div>

      {/* Gợi ý đường dẫn: Sách / Phiếu / Hồ sơ */}
      <div className="home-cards">
        <section className="home-card home-card-intro">
          <span className="home-card-icon" aria-hidden="true">
            📖
          </span>
          <h2>Bạn có thể</h2>
          <ul>
            <li>
              Xem danh sách sách tại <Link to="/member/books">Sách</Link>.
            </li>
            <li>
              Theo dõi sách đang mượn tại <Link to="/member/borrowed">Sách đang mượn</Link>.
            </li>
            <li>
              Xem thông tin tài khoản tại <Link to="/member/profile">Hồ sơ</Link>.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
