// NavLink: Link có biết route active; Outlet: chỗ render route con; useMatch: khớp path; useNavigate: đổi URL
import { NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom';
import { getUser } from '../api/index.js';

// Hàm đưa cho NavLink className — isActive true khi URL khớp link
const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

// Xóa token + user và chuyển về /auth/login (dùng chung 2 layout)
function logout(nav, msg) {
  if (!window.confirm(msg)) return; // User bấm Hủy thì không làm gì
  localStorage.removeItem('token'); // Xóa JWT
  localStorage.removeItem('user'); // Xóa user JSON
  nav('/auth/login', { replace: true }); // replace: không lưu bước back vào trang trước
}

// Layout sidebar cho bạn đọc — route /member/*
export function MemberLayout() {
  const navigate = useNavigate(); // Hàm navigate từ react-router
  const handleLogout = () => logout(navigate, 'Bạn có chắc chắn muốn đăng xuất không?'); // Bọc confirm

  return (
    <div className="app-layout user-ui">
      <aside className="sidebar">
        <div className="sidebar-title">Library Management</div>
        <nav className="sidebar-nav">
          <NavLink to="/member" end className={navClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/member/books" className={navClass}>
            Sách
          </NavLink>
          <NavLink to="/member/borrowed" className={navClass}>
            Sách đang mượn
          </NavLink>
          <NavLink to="/member/profile" className={navClass}>
            Hồ sơ
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button
            type="button"
            className="btn-logout"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet context={{ user: getUser(), navigate, handleLogout }} />
      </main>
    </div>
  );
}

// Layout sidebar cho thủ thư — route /librarian/*
export function LibrarianLayout() {
  const navigate = useNavigate();
  const isHome = !!useMatch({ path: '/librarian', end: true }); // true khi URL đúng /librarian (không có đuôi)
  const handleLogout = () => logout(navigate, 'Bạn có muốn đăng xuất?');

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Library Management</div>
        <nav className="sidebar-nav">
          <NavLink to="/librarian" end className={navClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/librarian/books" className={navClass}>
            Quản lý sách
          </NavLink>
          <NavLink to="/librarian/members" className={navClass}>
            Quản lý bạn đọc
          </NavLink>
          <NavLink to="/librarian/borrowings" className={navClass}>
            Quản lý phiếu mượn
          </NavLink>
          <NavLink to="/librarian/reports" className={navClass}>
            Báo cáo
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button
            type="button"
            className="btn-logout"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className={`main-content${isHome ? ' home-page' : ''}`}>
        <Outlet context={{ navigate, handleLogout }} />
      </main>
    </div>
  );
}
