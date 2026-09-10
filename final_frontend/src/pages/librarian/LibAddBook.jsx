// LibAddBook: /librarian/books/add — POST /api/books
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { U, docLoi } from '../../api/index.js';

/**
 * Thêm sách (`/librarian/books/add`).
 * `category` nhập text → map `category_id` (null nếu rỗng). `quantity` parseInt, mặc định 0.
 * Thành công → `navigate('/librarian/books')`.
 */
export default function LibAddBook() {
  const navigate = useNavigate();
  const [code, setCode] = useState(''); // Mã sách
  const [title, setTitle] = useState(''); // Tên
  const [author, setAuthor] = useState(''); // Tác giả
  const [category, setCategory] = useState(''); // ID thể loại (nhập text theo form hiện tại)
  const [publishYear, setPublishYear] = useState(''); // Năm XB
  const [quantity, setQuantity] = useState('0'); // Số lượng tồn
  const [pdfUrl, setPdfUrl] = useState(''); // Link PDF
  const [image, setImage] = useState(''); // URL ảnh bìa

  /**
   * Submit form: `POST U.books`, body JSON. Lỗi hiển thị qua `docLoi` hoặc alert kết nối.
   * @param {import('react').FormEvent} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      code,
      title,
      author,
      category_id: category || null,
      publish_year: publishYear,
      quantity: parseInt(quantity, 10) || 0,
      pdf_url: pdfUrl,
      image: image || null
    };
    try {
      const r = await fetch(U.books, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (r.ok) {
        alert('Thêm sách mới thành công!');
        navigate('/librarian/books');
      } else alert((await docLoi(r)).message || 'Có lỗi xảy ra!');
    } catch {
      alert('Lỗi kết nối Server!');
    }
  }

  return (
    <div className="container">
      {/* Form POST: code, title, author, category_id, publish_year, quantity, image, pdf_url */}
      <Link to="/librarian/books" className="btn-back">
        Quay lại
      </Link>
      <h1>Thêm sách</h1>
      <form id="form-book" onSubmit={onSubmit}>
        <label>Mã sách</label>
        <input type="text" name="code" required value={code} onChange={(e) => setCode(e.target.value)} />
        <label>Tên sách</label>
        <input type="text" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Tác giả</label>
        <input type="text" name="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <label>Thể loại</label>
        <input type="text" name="category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <label>Năm xuất bản</label>
        <input
          type="text"
          name="publishYear"
          placeholder="VD: 2020"
          maxLength={4}
          pattern="[0-9]{4}"
          value={publishYear}
          onChange={(e) => setPublishYear(e.target.value)}
        />
        <label>Số lượng</label>
        <input type="number" name="quantity" min={0} placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Link ảnh bìa sách (URL):</label>
        <input
          type="text"
          id="book-image"
          className="form-control"
          placeholder="Dán link ảnh sách vào đây (https://...)"
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }}
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <label>Link PDF đọc thử</label>
        <input type="url" name="pdfUrl" placeholder="https://... hoặc đường dẫn file PDF" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
        <button type="submit" className="btn">
          Thêm sách
        </button>
        <Link to="/librarian/books" className="btn">
          Hủy
        </Link>
      </form>
    </div>
  );
}
