// LibEditBook: /librarian/books/edit/:id — GET + PUT /api/books/:id
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { U, docLoi } from '../../api/index.js';

/**
 * Sửa sách (`/librarian/books/edit/:id`).
 * Mount: GET một lần — 404/ lỗi → alert và quay danh sách hoặc để form trống nếu chỉ lỗi mạng.
 * Submit: PUT cùng body với thêm mới; mã sách trên form readOnly nhưng vẫn gửi trong body (theo backend).
 */
export default function LibEditBook() {
  const { id } = useParams(); // id sách trên URL
  const navigate = useNavigate();
  const [code, setCode] = useState(''); // Mã (readOnly trên form nhưng vẫn bind state)
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(''); // category_id dạng chuỗi
  const [publishYear, setPublishYear] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [image, setImage] = useState(''); // URL ảnh bìa

  useEffect(() => {
    if (!id) return; // Không fetch nếu thiếu id
    (async () => {
      try {
        const r = await fetch(`${U.books}/${id}`);
        if (!r.ok) {
          alert('Không tìm thấy thông tin sách!');
          navigate('/librarian/books');
          return;
        }
        const s = await r.json();
        setCode(s.code || '');
        setTitle(s.title || '');
        setAuthor(s.author || '');
        setCategory(s.category_id != null ? String(s.category_id) : '');
        setPublishYear(s.publish_year || '');
        setQuantity(s.quantity != null ? String(s.quantity) : '');
        setPdfUrl(s.pdf_url || '');
        setImage(s.image || '');
      } catch {
        // Lỗi mạng khi tải sách — giữ form trống
      }
    })();
  }, [id, navigate]);

  /**
   * PUT `${U.books}/${id}`. `category_id` từ chuỗi hoặc null.
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
      const r = await fetch(`${U.books}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (r.ok) {
        alert('Cập nhật sách thành công!');
        navigate('/librarian/books');
      } else alert((await docLoi(r)).message || 'Có lỗi xảy ra!');
    } catch {
      alert('Lỗi kết nối Server!');
    }
  }

  return (
    <div className="container admin-ui">
      {/* Form PUT — mã sách readOnly; category_id là số */}
      <Link to="/librarian/books" className="btn-back">
        Quay lại
      </Link>
      <h1>Sửa thông tin sách</h1>
      <div className="form-container">
        <form id="form-book" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={id || ''} readOnly />
          <div className="form-group">
            <label>Mã sách</label>
            <input type="text" name="code" className="form-control" readOnly style={{ backgroundColor: '#f3f4f6' }} value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tên sách</label>
            <input type="text" name="title" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tác giả</label>
            <input type="text" name="author" className="form-control" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Thể loại (ID)</label>
            <input
              type="number"
              name="category"
              className="form-control"
              placeholder="Nhập ID thể loại (1-45)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Năm xuất bản</label>
            <input
              type="text"
              name="publishYear"
              className="form-control"
              placeholder="VD: 2020"
              maxLength={4}
              pattern="[0-9]{4}"
              value={publishYear}
              onChange={(e) => setPublishYear(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Số lượng</label>
            <input type="number" name="quantity" className="form-control" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Link ảnh bìa sách (URL):</label>
            <input
              type="text"
              id="edit-book-image"
              className="form-control"
              placeholder="Dán link ảnh sách vào đây..."
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }}
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Link PDF đọc thử</label>
            <input type="url" name="pdfUrl" className="form-control" placeholder="https://..." value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
          </div>
          <div className="form-actions" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="submit" className="btn">
              Cập nhật
            </button>
            <Link to="/librarian/books" className="btn" style={{ background: '#94a3b8', borderColor: '#94a3b8' }}>
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
