// LibBookDetail: /librarian/books/detail/:id — GET /api/books/:id, iframe PDF
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { U } from '../../api/index.js';

/**
 * Chi tiết sách phía thủ thư (`/librarian/books/detail/:id`).
 * Giống member: bảng metadata + PDF mở tab + iframe `gview`.
 * Nút “Mượn sách” chỉ demo (alert), không POST phiếu — luồng thật dùng màn hình member hoặc tạo phiếu thủ thư.
 */
export default function LibBookDetail() {
  const { id: bookId } = useParams(); // id từ URL /librarian/books/detail/:id
  const [book, setBook] = useState(null); // null: đang tải hoặc lỗi
  const [err, setErr] = useState(false); // true: fetch GET thất bại

  useEffect(() => {
    if (!bookId) return; // Không gọi API nếu thiếu id
    (async () => {
      try {
        const r = await fetch(`${U.books}/${bookId}`);
        if (!r.ok) throw new Error('fail');
        setBook(await r.json());
        setErr(false);
      } catch {
        setErr(true);
        setBook(null);
      }
    })();
  }, [bookId]);

  // Nội dung khối chi tiết: lỗi id / lỗi mạng / loading / bảng + PDF + nút (demo mượn)
  let inner;
  if (!bookId) inner = <p style={{ color: 'red', textAlign: 'center' }}>Không tìm thấy mã sách!</p>;
  else if (err) inner = <p style={{ color: 'red', textAlign: 'center' }}>Lỗi kết nối Server!</p>;
  else if (!book) inner = <p className="reports-loading">Đang tải dữ liệu từ Server...</p>;
  else {
    const bad = book.status === 'Đang mượn' || book.quantity <= 0; // Coi như không còn cho mượn
    const stCls = bad ? 'status-borrowing' : 'status-active';
    const pdf = (book.pdf_url || '').trim();
    inner = (
      <>
        <table className="detail-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <th style={{ width: 150, padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>Mã sách</th>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{book.code || ''}</td>
            </tr>
            <tr>
              <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>Tên sách</th>
              <td style={{ padding: 10, border: '1px solid #eee', fontWeight: 'bold' }}>{book.title || ''}</td>
            </tr>
            <tr>
              <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>Tác giả</th>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{book.author || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>Thể loại</th>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{book.category_name || `ID: ${book.category_id}`}</td>
            </tr>
            <tr>
              <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>Năm xuất bản</th>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{book.publish_year || '–'}</td>
            </tr>
            <tr>
              <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>Số lượng</th>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{book.quantity ?? '–'}</td>
            </tr>
            <tr>
              <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>Trạng thái</th>
              <td style={{ padding: 10, border: '1px solid #eee' }}>
                <span className={`status-badge ${stCls}`}>{book.status}</span>
              </td>
            </tr>
            {pdf ? (
              <tr>
                <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>File đọc thử</th>
                <td style={{ padding: 10, border: '1px solid #eee' }}>
                  <a
                    href={pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-success"
                    style={{ backgroundColor: '#10b981', borderColor: '#10b981', textDecoration: 'none', padding: '8px 15px', borderRadius: 4 }}
                  >
                    Mở PDF tab mới
                  </a>
                </td>
              </tr>
            ) : (
              <tr>
                <th style={{ padding: 10, border: '1px solid #eee', background: '#f8fafc' }}>File đọc thử</th>
                <td style={{ padding: 10, border: '1px solid #eee', color: '#64748b' }}>Sách này chưa có bản PDF</td>
              </tr>
            )}
          </tbody>
        </table>
        {pdf && (
          <div style={{ marginTop: 30, background: '#f8fafc', padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <h3 style={{ marginBottom: 15, color: '#1e293b' }}>Đọc thử PDF online</h3>
            <iframe
              title="pdf"
              src={`https://docs.google.com/gview?url=${encodeURIComponent(pdf)}&embedded=true`}
              width="100%"
              height={600}
              style={{ border: 'none', borderRadius: 4 }}
            />
          </div>
        )}
        {bad ? (
          <button
            type="button"
            className="btn"
            style={{ fontSize: '1.1rem', padding: '10px 20px', marginTop: 20, background: '#94a3b8', cursor: 'not-allowed' }}
            disabled
          >
            Hết sách
          </button>
        ) : (
          <button
            type="button"
            id="btn-borrow"
            className="btn btn-primary"
            style={{ fontSize: '1.1rem', padding: '10px 20px', marginTop: 20 }}
            onClick={() => {
              // Demo UI: không POST phiếu (luồng mượn thật nằm ở member hoặc LibAddBorrowing)
              if (!localStorage.getItem('user')) return alert('Vui lòng đăng nhập để mượn sách!');
              alert('Yêu cầu mượn sách đã được ghi nhận!');
            }}
          >
            Mượn sách
          </button>
        )}
      </>
    );
  }

  return (
    <div className="container">
      {/* Khối chi tiết (inner) — không có sidebar riêng */}
      <Link to="/librarian/books" className="btn-back">
        Quay lại
      </Link>
      <h1>Thông tin chi tiết sách</h1>
      <div className="book-detail-box" id="book-detail-container">
        {inner}
      </div>
    </div>
  );
}
