import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { U } from '../../api/index.js';

export default function LibMemberDetail() {
  const { id } = useParams(); // Lấy ID bạn đọc từ URL
  const [member, setMember] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm format ngày tháng cho đẹp
  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy thông tin cá nhân của bạn đọc (Giả sử bạn có API này để Edit)
        const memberRes = await fetch(`${U.users || '[https://library-backend-api-3xcu.onrender.com](https://library-backend-api-3xcu.onrender.com)/api/members'}/${id}`);
        if (memberRes.ok) setMember(await memberRes.json());

        // 2. Lấy lịch sử mượn sách của riêng người này
        const borrowRes = await fetch(`${U.borrowings}/user/${id}`);
        if (borrowRes.ok) {
          setBorrowings(await borrowRes.json());
        } else {
          setBorrowings([]); // Nếu lỗi 404 (chưa mượn bao giờ) thì set mảng rỗng
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Đang tải dữ liệu...</div>;

  // Thống kê nhanh
  const total = borrowings.length;
  const dangMuon = borrowings.filter(b => b.status === 'Đang mượn').length;
  const daTra = borrowings.filter(b => b.status === 'Đã trả').length;
  const choDuyet = borrowings.filter(b => b.status === 'Chờ duyệt').length;

  return (
    <div className="container user-ui">
      <Link to="/librarian/members" className="btn-back" style={{ marginBottom: '20px', display: 'inline-block' }}>
         Quay lại danh sách
      </Link>
      
      <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>
        Chi tiết lịch sử mượn sách: <span style={{ color: '#3b82f6' }}>{member?.name || `Bạn đọc #${id}`}</span>
      </h2>

      {/* Box Thống kê */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '1rem' }}>Tổng số phiếu</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{total}</p>
        </div>
        <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', flex: 1, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '1rem' }}>Đang mượn</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>{dangMuon}</p>
        </div>
        <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', flex: 1, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6', fontSize: '1rem' }}>Đã trả</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>{daTra}</p>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <table className="books-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead style={{ background: '#1e293b', color: 'white' }}>
          <tr>
            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Mã phiếu</th>
            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Tên sách</th>
            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Ngày mượn</th>
            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Hạn trả</th>
            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {borrowings.length === 0 ? (
            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Bạn đọc này chưa mượn cuốn sách nào.</td></tr>
          ) : (
            borrowings.map(b => {
              let statusClass = 'status-active'; // Xanh lá
              if (b.status === 'Chờ duyệt') statusClass = 'status-warning'; // Vàng
              else if (b.status === 'Đang mượn') statusClass = 'status-borrowing'; // Xanh dương
              else if (b.status === 'Từ chối' || b.status === 'Quá hạn') statusClass = 'status-locked'; // Đỏ

              return (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 15px', color: '#64748b' }}>#{b.id}</td>
                  <td style={{ padding: '12px 15px', fontWeight: '500' }}>{b.book_title || 'Sách không xác định'}</td>
                  <td style={{ padding: '12px 15px' }}>{formatDate(b.borrow_date)}</td>
                  <td style={{ padding: '12px 15px' }}>{formatDate(b.due_date)}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <span className={`status-badge ${statusClass}`}>{b.status}</span>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}