// MemberBooks: /member/books — GET danh sách sách, lọc (Tên + Thể loại) + phân trang client
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { U } from '../../api/index.js';

// 1. "BẢN ĐỒ" THỂ LOẠI - Tự định nghĩa tên dựa trên ID trong Database
const CATEGORY_MAP = {
  "1": "Lập trình (IT)",
  "2": "Kinh tế",
  "3": "Kỹ năng / Văn học",
  "4": "Khoa học"
};

// Mảng URL ảnh Unsplash — dùng khi book.image trống
const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1509266275458-5c9788fb5b5d?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=560&fit=crop&auto=format', 
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=560&fit=crop&auto=format' 
];

const PER = 8; // Số sách hiển thị mỗi trang

export default function MemberBooks() {
  const navigate = useNavigate(); 
  const [all, setAll] = useState([]); // Toàn bộ sách từ API
  const [search, setSearch] = useState(''); // Chuỗi tìm kiếm
  const [categoryId, setCategoryId] = useState(''); // Bộ lọc thể loại
  const [page, setPage] = useState(1); // Trang hiện tại
  const [error, setError] = useState(false); // Lỗi tải danh sách
  const [loading, setLoading] = useState(true); // Trạng thái tải

  // Bảo vệ route
  useEffect(() => {
    if (!localStorage.getItem('user')) navigate('/auth/login', { replace: true }); 
  }, [navigate]);

  // Fetch dữ liệu sách
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(U.books); 
        if (!r.ok) throw new Error('fail');
        setAll(await r.json()); 
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false); 
      }
    })();
  }, []);

  // Lọc kép: Theo tên/tác giả VÀ theo thể loại
  const k = search.toLowerCase().trim(); 
  const filtered = all.filter((b) => {
    const matchSearch = !k || (b.title && b.title.toLowerCase().includes(k)) || (b.author && b.author.toLowerCase().includes(k));
    const matchCat = !categoryId || String(b.category_id) === String(categoryId);
    return matchSearch && matchCat;
  });

  // Đổi từ khóa hoặc bộ lọc -> tự động về trang 1
  useEffect(() => setPage(1), [search, categoryId]); 

  // Phân trang
  const totalPages = Math.ceil(filtered.length / PER) || 1; 
  const slice = filtered.slice((page - 1) * PER, page * PER); 

  const changePage = (np) => {
    if (np < 1 || np > totalPages) return; 
    setPage(np);
    document.querySelector('.books-toolbar')?.scrollIntoView({ behavior: 'smooth' }); 
  };

  return (
    <div className="container user-ui">
      <Link to="/member" className="btn-back">
        Quay lại
      </Link>
      <h1 style={{ marginBottom: '15px', color: '#0f172a' }}>Khám phá Thư viện</h1>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>Tìm kiếm và chọn những cuốn sách bạn yêu thích.</p>

      {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
      <div className="books-toolbar" style={{ 
          marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap',
          background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0'
      }}>
        <div className="book-search-wrap" style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            id="book-search"
            className="book-search-input"
            placeholder="Tìm theo tên sách hoặc tác giả..."
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 15px', borderRadius: '8px',
              border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none'
            }}
          />
        </div>

        <div style={{ flex: '0 0 220px' }}>
          <select
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 15px', borderRadius: '8px', 
              border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer', background: 'white' 
            }}
          >
            <option value="">Tất cả thể loại</option>
            {Object.keys(CATEGORY_MAP).map(id => (
              <option key={id} value={id}>{CATEGORY_MAP[id]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LƯỚI THẺ SÁCH */}
      <div id="books-grid" className="books-grid">
        {loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.2rem' }}>
            ⏳ Đang tải dữ liệu sách...
          </div>
        )}
        
        {error && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ef4444', fontSize: '1.2rem', padding: '40px' }}>
             Lỗi kết nối Server! Vui lòng bật Backend.
          </div>
        )}
        
        {!loading && !error && !slice.length && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '1.2rem', background: 'white', borderRadius: '12px' }}>
            Không tìm thấy cuốn sách nào phù hợp! 
          </div>
        )}
        
        {!loading && !error && slice.map((book) => {
            const ok = book.quantity > 0;
            const bc = ok ? 'badge-available' : 'badge-unavailable';
            const bt = ok ? 'Có sẵn' : 'Hết sách';
            const img = book.image && String(book.image).trim() !== ''
                ? book.image.trim()
                : FALLBACK_COVERS[Math.abs(Number(book.id) || 0) % FALLBACK_COVERS.length];
            
            // Lấy tên Thể loại từ Map, nếu không có ID khớp thì để là 'Khác'
            const catName = CATEGORY_MAP[String(book.category_id)] || 'Khác';

            return (
              <div
                key={book.id}
                className="book-card"
                onClick={() => navigate(`/member/books/${book.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/member/books/${book.id}`)}
              >
                <span className={`book-badge ${bc}`}>{bt}</span>
                <div className="book-cover-wrapper">
                  <img
                    src={img}
                    className="book-cover"
                    alt={book.title}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Cover'; }}
                  />
                </div>
                <div className="book-info">
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    {catName}
                  </span>
                  <h3 className="book-title" title={book.title} style={{ marginTop: '0' }}>
                    {book.title}
                  </h3>
                  <p className="book-author"> {book.author || 'Nhiều tác giả'}</p>
                </div>
              </div>
            );
          })}
      </div>

      {/* PHÂN TRANG GỐC CỦA BẠN */}
      <div id="pagination-container" className="pagination">
        {totalPages > 1 && (
          <>
            <button type="button" className="page-btn" disabled={page === 1} onClick={() => changePage(page - 1)}>
              &laquo; Trang trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
              <button
                key={i}
                type="button"
                className={`page-btn ${i === page ? 'active' : ''}`}
                onClick={() => changePage(i)}
              >
                {i}
              </button>
            ))}
            <button
              type="button"
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
            >
              Trang sau &raquo;
            </button>
          </>
        )}
      </div>
    </div>
  );
}