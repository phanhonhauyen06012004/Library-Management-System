// LibAddBorrowing: /librarian/borrowings/add — GET members+books, POST borrowings
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { U, docLoi, homNay, sauNgay } from '../../api/index.js';

/**
 * Tạo phiếu mượn (`/librarian/borrowings/add`).
 * `useEffect`: `Promise.all` GET members + books cho `<select>`. Ngày mặc định `homNay` / `sauNgay(14)`.
 * POST body gồm `member_id`, `book_id`, `borrow_date`, `due_date`, `return_date: null`.
 */
export default function LibAddBorrowing() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]); // Dropdown bạn đọc
  const [books, setBooks] = useState([]); // Dropdown sách
  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [borrowDate, setBorrowDate] = useState(() => homNay()); // ngày mượn mặc định
  const [dueDate, setDueDate] = useState(() => sauNgay(14)); // hạn +14 ngày

  // Tải danh sách member + sách cho hai dropdown
  useEffect(() => {
    (async () => {
      try {
        const [rm, rb] = await Promise.all([fetch(U.members), fetch(U.books)]);
        if (rm.ok) setMembers(await rm.json());
        if (rb.ok) setBooks(await rb.json());
      } catch {
        // Lỗi mạng khi tải dropdown — để trống
      }
    })();
  }, []);

  /**
   * POST `U.borrowings`. Giá trị select là string — backend nhận id (kiểu phụ thuộc API).
   * @param {import('react').FormEvent} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      member_id: memberId,
      book_id: bookId,
      borrow_date: borrowDate,
      due_date: dueDate,
      return_date: null
    };
    try {
      const r = await fetch(U.borrowings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (r.ok) {
        alert('Tạo phiếu mượn thành công!');
        navigate('/librarian/borrowings');
      } else alert((await docLoi(r)).message || 'Có lỗi xảy ra!');
    } catch {
      alert('Lỗi kết nối Server!');
    }
  }

  return (
    <div className="container">
      <Link to="/librarian/borrowings" className="btn-back">
        Quay lại
      </Link>
      <h1>Tạo phiếu mượn</h1>
      <form id="form-borrowing" onSubmit={onSubmit}>
        <label>Bạn đọc</label>
        <select name="memberId" required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          <option value="">-- Chọn bạn đọc --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.code})
            </option>
          ))}
        </select>
        <label>Sách</label>
        <select name="bookId" required value={bookId} onChange={(e) => setBookId(e.target.value)}>
          <option value="">-- Chọn sách --</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} ({b.code})
            </option>
          ))}
        </select>
        <label>Ngày mượn</label>
        <input type="date" name="borrowDate" required value={borrowDate} onChange={(e) => setBorrowDate(e.target.value)} />
        <label>Hạn trả</label>
        <input type="date" name="dueDate" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit" className="btn">
          Tạo phiếu
        </button>
        <Link to="/librarian/borrowings" className="btn">
          Hủy
        </Link>
      </form>
    </div>
  );
}
