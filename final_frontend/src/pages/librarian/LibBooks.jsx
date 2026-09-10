// LibBooks: /librarian/books — GET /api/books, lọc kw, DELETE xóa sách, navigate chi tiết/sửa
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { U, docLoi } from '../../api/index.js';

/**
 * Quản lý sách (`/librarian/books`).
 * - `refresh`: GET `U.books`, ép kiểu mảng; `loading`/`error` phục vụ hàng trống vs spinner.
 * - `applyFilter(kw)`: khớp chuỗi trong `code`, `title`, `author` (lowercase).
 * - Mỗi dòng: badge “Có sẵn”/“Hết sách” theo `quantity`; nút Chi tiết / Sửa (`navigate`), Xóa (`deleteBook`).
 */
export default function LibBooks() {
  const navigate = useNavigate(); // Đi tới chi tiết / sửa theo id
  const [kw, setKw] = useState(''); // Từ khóa lọc mã / tên / tác giả
  const [books, setBooks] = useState([]); // Toàn bộ sách từ API
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true); // Lần đầu và mỗi lần refresh sau xóa

  /**
   * Tải lại toàn bộ danh sách sách từ API.
   * Dùng khi mount và sau khi xóa sách thành công. `finally` luôn tắt `loading`.
   */
  async function refresh() {
    setLoading(true);
    try {
      const list = await (await fetch(U.books)).json();
      setBooks(Array.isArray(list) ? list : []);
      setError(false);
    } catch {
      setError(true);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  /**
   * @param {object[]} list - Danh sách sách gốc
   * @param {string} keyword - Chuỗi tìm (rỗng → trả nguyên `list`)
   * @returns {object[]} Bản đã lọc
   */
  const applyFilter = (list, keyword) => {
    const k = keyword.toLowerCase();
    if (!k) return list;
    return list.filter((book) =>
      [book.code, book.title, book.author].some((t) => (t || '').toLowerCase().includes(k))
    );
  };

  const visible = applyFilter(books, kw);

  /**
   * DELETE `${U.books}/${id}`. Thành công → `alert` + `refresh()`; lỗi → `docLoi(r)` hoặc alert mạng.
   * @param {string|number} id - Khóa chính sách
   */
  async function deleteBook(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này không?')) return;
    try {
      const r = await fetch(`${U.books}/${id}`, { method: 'DELETE' });
      if (r.ok) {
        alert('Đã xóa sách thành công!');
        refresh();
      } else alert((await docLoi(r)).message || 'Lỗi khi xóa sách!');
    } catch {
      alert('Lỗi kết nối khi xóa sách!');
    }
  }

  return (
    <div className="container">
      {/* Thanh công cụ: Thêm sách + ô tìm; bảng: lỗi / rỗng / loading / từng dòng + 3 nút */}
      <Link to="/librarian" className="btn-back">
        Quay lại
      </Link>
      <h1>Quản lý sách</h1>
      <div className="books-toolbar">
        <Link to="/librarian/books/add" className="btn">
          Thêm sách
        </Link>
        <div className="book-search-wrap">
          <input
            type="text"
            id="book-search"
            className="book-search-input"
            placeholder="Tìm theo tên sách hoặc tác giả..."
            autoComplete="off"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
          />
        </div>
      </div>

      <table id="books-table">
        <thead>
          <tr>
            <th>Mã sách</th>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Năm XB</th>
            <th className="center-text">Số lượng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody id="books-tbody">
          {error && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: 'red' }}>
                Không thể kết nối Server!
              </td>
            </tr>
          )}
          {!error && !loading && !visible.length && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                {kw.trim() ? 'Không tìm thấy sách phù hợp.' : 'Chưa có dữ liệu.'}
              </td>
            </tr>
          )}
          {!error && loading && !visible.length && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                Đang tải dữ liệu...
              </td>
            </tr>
          )}
          {!error &&
            visible.map((book) => {
              const ok = book.quantity > 0;
              const sc = ok ? 'status-active' : 'status-locked';
              const st = ok ? 'Có sẵn' : 'Hết sách';
              const id = book.id;
              return (
                <tr key={id}>
                  <td>{book.code || ''}</td>
                  <td style={{ fontWeight: 600 }}>{book.title || ''}</td>
                  <td>{book.author || ''}</td>
                  <td>{book.publish_year || ''}</td>
                  <td className="center-text">{book.quantity != null ? book.quantity : ''}</td>
                  <td>
                    <span className={`status-badge ${sc}`}>{st}</span>
                  </td>
                  <td>
                    <div className="action-group" style={{ display: 'flex', gap: 5 }}>
                      <button
                        type="button"
                        className="btn btn-success"
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/librarian/books/detail/${id}`)}
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/librarian/books/edit/${id}`)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                        onClick={() => deleteBook(id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
