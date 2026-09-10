// LibHome: route /librarian — Trang chủ thủ thư: chỉ hiển thị nội dung tĩnh + link Báo cáo (không gọi API)
import { Link } from 'react-router-dom';

/**
 * Trang chủ khu vực thủ thư (`/librarian`).
 * Chỉ render HTML + `Link` nội bộ: giới thiệu quy tắc mượn (3 cuốn, 14 ngày), lưu ý vận hành,
 * link tới `/librarian/reports`. Không `fetch`, không state — phù hợp làm “dashboard” tĩnh.
 */
export default function LibHome() {
  return (
    <div className="container">
      <Link to="/librarian" className="btn-back">
        Quay lại
      </Link>
      {/* Tiêu đề và mô tả ngắn */}
      <header className="home-hero">
        <h1>Trang chủ</h1>
        <p>Sử dụng menu bên trái để truy cập các chức năng quản lý.</p>
      </header>

      {/* Ba khối: giới thiệu hệ thống — quy tắc nghiệp vụ — lưu ý vận hành */}
      <div className="home-cards">
        <section className="home-card home-card-intro">
          <span className="home-card-icon" aria-hidden="true">
            📖
          </span>
          <h2>1. Giới thiệu hệ thống</h2>
          <ul>
            <li>Hệ thống hỗ trợ quản lý sách, bạn đọc và phiếu mượn trong thư viện.</li>
            <li>Sử dụng menu bên trái để truy cập các chức năng quản lý.</li>
          </ul>
        </section>

        <section className="home-card home-card-info">
          <span className="home-card-icon" aria-hidden="true">
            📋
          </span>
          <h2>2. Thông tin quản lý</h2>
          <ul>
            <li>Mỗi bạn đọc được mượn tối đa 3 cuốn sách.</li>
            <li>Thời gian mượn tối đa 14 ngày.</li>
            <li>Hệ thống hỗ trợ theo dõi trạng thái mượn, đã trả và quá hạn.</li>
          </ul>
        </section>

        <section className="home-card home-card-notes">
          <span className="home-card-icon" aria-hidden="true">
            💡
          </span>
          <h2>3. Lưu ý cho quản lý</h2>
          <ul>
            <li>Kiểm tra thông tin bạn đọc trước khi tạo phiếu mượn.</li>
            <li>Cập nhật trạng thái khi sách đã được trả.</li>
            <li>
              Theo dõi sách quá hạn trong mục <Link to="/librarian/reports">Báo cáo</Link>.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
