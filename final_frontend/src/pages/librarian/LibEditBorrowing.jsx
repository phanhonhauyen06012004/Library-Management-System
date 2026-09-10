// LibEditBorrowing: /librarian/borrowings/edit/:id — GET×3, PUT /borrowings/:id
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { U, docLoi, chiNgay } from '../../api/index.js';

/**
 * Sửa phiếu (`/librarian/borrowings/edit/:id`).
 * Load: song song GET members, books, và `GET ${U.borrowings}/${id}`; ngày trong form qua `chiNgay` (chuỗi YYYY-MM-DD cho `<input type="date">`).
 * `return_date` rỗng → gửi `null`.
 */
export default function LibEditBorrowing() {
  const { id } = useParams(); // id phiếu mượn
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [rm, rb, rw] = await Promise.all([fetch(U.members), fetch(U.books), fetch(`${U.borrowings}/${id}`)]);
        if (rm.ok) setMembers(await rm.json());
        if (rb.ok) setBooks(await rb.json());
        if (!rw.ok) {
          alert('Không tìm thấy phiếu mượn!');
          return;
        }
        const b = await rw.json();
        setMemberId(String(b.member_id || ''));
        setBookId(String(b.book_id || ''));
        setBorrowDate(chiNgay(b.borrow_date));
        setDueDate(chiNgay(b.due_date));
        setReturnDate(chiNgay(b.return_date) || '');
      } catch {
        // Lỗi mạng khi tải phiếu / danh sách — form có thể trống
      }
    })();
  }, [id]);

  /**
   * PUT `${U.borrowings}/${id}` với toàn bộ trường form.
   * @param {import('react').FormEvent} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      member_id: memberId,
      book_id: bookId,
      borrow_date: borrowDate,
      due_date: dueDate,
      return_date: returnDate || null
    };
    try {
      const r = await fetch(`${U.borrowings}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (r.ok) {
        alert('Cập nhật thành công!');
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
      <h1>Sửa phiếu mượn / Xác nhận trả sách</h1>
      <form id="form-borrowing" onSubmit={onSubmit}>
        <input type="hidden" name="id" value={id || ''} readOnly />
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
        <label>Ngày trả thực tế</label>
        <input type="date" name="returnDate" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        <button type="submit" className="btn">
          Cập nhật
        </button>
        <Link to="/librarian/borrowings" className="btn">
          Hủy
        </Link>
      </form>
    </div>
  );
}
