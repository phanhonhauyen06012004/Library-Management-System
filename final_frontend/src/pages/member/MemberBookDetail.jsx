// MemberBookDetail: /member/books/:id — GET sách, POST phiếu mượn (14 ngày), xem PDF nhúng
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { U, homNay, sauNgay } from '../../api/index.js';

/**
 * Chi tiết sách cho member (`/member/books/:id`).
 *
 * - `bookId` từ `useParams`; GET `${U.books}/${bookId}` khi có id.
 * - `bad`: không cho đăng ký khi `book.status === 'Đang mượn'` hoặc `quantity <= 0`.
 * - PDF: link mở tab mới; iframe Google Docs Viewer (`gview`) — URL PDF phải truy cập được từ internet.
 * - `handleBorrow`: POST `U.borrowings` với `borrow_date = homNay()`, `due_date = sauNgay(14)`;
 *   thành công → alert OTP (`data.otp`) và `navigate('/member/borrowed')`.
 */
export default function MemberBookDetail() {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      try {
        const r = await fetch(`${U.books}/${bookId}`);
        if (!r.ok) throw new Error('fail');
        setBook(await r.json());
        setLoadError(false);
      } catch {
        setLoadError(true);
        setBook(null);
      }
    })();
  }, [bookId]);

  async function handleBorrow() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Vui lòng đăng nhập để mượn sách!');
      navigate('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    try {
      const res = await fetch(U.borrowings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: user.id,
          book_id: book.id,
          borrow_date: homNay(),
          due_date: sauNgay(14)
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`🎉 ĐĂNG KÝ MƯỢN THÀNH CÔNG!\n\nMã xác nhận của bạn là: ${data.otp}\n\n(Vui lòng cung cấp mã này tại quầy để nhận sách)`);
        navigate('/member/borrowed');
      } else {
        const j = await res.json().catch(() => ({}));
        alert(j.message || 'Lỗi khi đăng ký!');
      }
    } catch {
      alert('Lỗi kết nối Server khi mượn sách!');
    }
  }

  /**
   * Đăng ký mượn sách (đọc user từ `localStorage.user` JSON).
   * Lỗi không ném exception: luôn `alert` (mạng, 4xx/5xx, chưa đăng nhập).
   * Body POST: `{ member_id, book_id, borrow_date, due_date }` — `book_id` lấy từ state `book.id`.
   */
  async function handleBorrow() {
    const userStr = localStorage.getItem('user'); // Chuỗi JSON user
    if (!userStr) {
      alert('Vui lòng đăng nhập để mượn sách!');
      navigate('/auth/login');
      return;
    }
    const user = JSON.parse(userStr); // Object { id, name, role, ... }
    try {
      const res = await fetch(U.borrowings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: user.id,
          book_id: book.id,
          borrow_date: homNay(),
          due_date: sauNgay(14)
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(
          `🎉 ĐĂNG KÝ MƯỢN THÀNH CÔNG!\n\nMã xác nhận của bạn là: ${data.otp}\n\n(Vui lòng cung cấp mã này tại quầy để nhận sách)`
        );
        navigate('/member/borrowed');
      } else {
        const j = await res.json().catch(() => ({}));
        alert(j.message || 'Lỗi khi đăng ký!');
      }
    } catch {
      alert('Lỗi kết nối Server khi mượn sách!');
    }
  }

  let inner; // Một trong các nhánh JSX hiển thị trong khung chi tiết
  if (!bookId) {
    inner = <p style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Không tìm thấy mã sách!</p>;
  } else if (loadError) {
    inner = (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '10px' }}>Lỗi kết nối Server!</p>
        <p style={{ color: '#64748b' }}>Vui lòng kiểm tra lại Backend hoặc thử lại sau.</p>
      </div>
    );
  } else if (!book) {
    inner = <p className="reports-loading" style={{ textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu từ Server...</p>;
  } else {
    const bad = book.status === 'Đang mượn' || book.quantity <= 0; // Không cho mượn
    const stCls = bad ? 'status-borrowing' : 'status-active'; // Class CSS badge
    const pdf = (book.pdf_url || '').trim(); // Link PDF hoặc rỗng
    inner = (
      <>
        <table className="book-info-table">
          <tbody>
            <tr>
              <th>Mã sách</th>
              <td>{book.code || ''}</td>
            </tr>
            <tr>
              <th>Tên sách</th>
              <td style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' }}>{book.title || ''}</td>
            </tr>
            <tr>
              <th>Tác giả</th>
              <td>{book.author || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <th>Thể loại</th>
              <td>{book.category_name || `ID: ${book.category_id}`}</td>
            </tr>
            <tr>
              <th>Năm xuất bản</th>
              <td>{book.publish_year || '–'}</td>
            </tr>
            <tr>
              <th>Số lượng tồn kho</th>
              <td>{book.quantity ?? '–'} cuốn</td>
            </tr>
            <tr>
              <th>Trạng thái</th>
              <td>
                <span className={`status-badge ${stCls}`}>{book.status}</span>
              </td>
            </tr>
            {pdf ? (
              <tr>
                <th>File đọc thử</th>
                <td>
                  <a
                    href={pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-success"
                    style={{
                      backgroundColor: '#10b981',
                      borderColor: '#10b981',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                  >
                    Mở PDF tab mới
                  </a>
                </td>
              </tr>
            ) : (
              <tr>
                <th>File đọc thử</th>
                <td style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sách này chưa có bản PDF đọc thử</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Google Docs Viewer: nhúng PDF qua URL (cần PDF public trên mạng) */}
        {pdf && (
          <div className="pdf-viewer-container">
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#334155', fontSize: '1.2rem' }}>
              📖 Đọc thử PDF online
            </h3>
            <iframe
              title="pdf-preview"
              src={`https://docs.google.com/gview?url=${encodeURIComponent(pdf)}&embedded=true`}
              width="100%"
              height="600px"
              style={{ border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white' }}
            />
          </div>
        )}
        {bad ? (
          <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              type="button"
              className="btn"
              style={{
                fontSize: '1.1rem',
                padding: '12px 24px',
                background: '#cbd5e1',
                color: '#64748b',
                border: 'none',
                borderRadius: '6px',
                cursor: 'not-allowed'
              }}
              disabled
            >
              Mượn sách
            </button>
            <span style={{ color: '#ef4444', fontWeight: 500 }}>⚠️ Sách này đã hết hoặc đang được mượn!</span>
          </div>
        ) : (
          <button
            type="button"
            id="btn-borrow"
            className="btn btn-primary"
            style={{ fontSize: '1.1rem', padding: '12px 24px', marginTop: '25px', borderRadius: '6px', cursor: 'pointer' }}
            onClick={handleBorrow}
          >
            Đăng ký mượn
          </button>
        )}
      </>
    );
  }

  return (
    <div className="container user-ui">
      <Link to="/member/books" className="btn-back">
        Quay lại
      </Link>
      <h1 style={{ marginBottom: '20px' }}>Thông tin chi tiết sách</h1>
      <div id="book-detail-container" className="book-detail-box" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        {inner}
      </div>
    </div>
  );
}
