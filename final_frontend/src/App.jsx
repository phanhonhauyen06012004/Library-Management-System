
import LibMemberDetail from './pages/librarian/LibMemberDetail';

import MemberPdfViewer from './pages/member/MemberPdfViewer';

// Hook chạy side effect sau render (đồng bộ session, chuyển hướng...)
import { useEffect } from 'react';
// Routes: tập route; Route: 1 URL; Navigate: redirect; Outlet: lỗ trang con; useNavigate: chuyển URL bằng code
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
// Style riêng App (import thêm CSS member/librarian)
import './App.css';
// Hàm đọc user đã đăng nhập từ localStorage
import { getUser } from './api/index.js';
// Hai layout: sidebar member vs sidebar thủ thư
import { MemberLayout, LibrarianLayout } from './components/Layouts.jsx';
// --- Trang auth (không cần đăng nhập trước) ---
import Login from './pages/auth/Login.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ChangePassword from './pages/auth/ChangePassword.jsx';
// --- Trang bạn đọc (sau login, role member) ---
import MemberHome from './pages/member/MemberHome.jsx';
import MemberBooks from './pages/member/MemberBooks.jsx';
import MemberBookDetail from './pages/member/MemberBookDetail.jsx';
import MemberBorrowed from './pages/member/MemberBorrowed.jsx';
import MemberProfile from './pages/member/MemberProfile.jsx';
// --- Trang thủ thư (sau login, role admin) ---
import LibHome from './pages/librarian/LibHome.jsx';
import LibBooks from './pages/librarian/LibBooks.jsx';
import LibBookDetail from './pages/librarian/LibBookDetail.jsx';
import LibAddBook from './pages/librarian/LibAddBook.jsx';
import LibEditBook from './pages/librarian/LibEditBook.jsx';
import LibMembers from './pages/librarian/LibMembers.jsx';
import LibAddMember from './pages/librarian/LibAddMember.jsx';
import LibEditMember from './pages/librarian/LibEditMember.jsx';
import LibBorrowings from './pages/librarian/LibBorrowings.jsx';
import LibAddBorrowing from './pages/librarian/LibAddBorrowing.jsx';
import LibEditBorrowing from './pages/librarian/LibEditBorrowing.jsx';
import LibReports from './pages/librarian/LibReports.jsx';

// Component bọc route: chỉ render <Outlet /> khi đúng quyền (admin hoặc member)
function Guard({ admin }) {
  const nav = useNavigate(); // Hàm đổi URL programmatically
  const key = localStorage.getItem('user'); // Phụ thuộc để useEffect chạy lại khi login/logout
  const u = getUser(); // User hiện tại hoặc null
  useEffect(() => {
    const x = getUser();
    if (!x) nav('/auth/login', { replace: true }); // Chưa login → login
    else if (admin ? x.role !== 'admin' : x.role === 'admin')
      nav(admin ? '/member' : '/librarian', { replace: true }); // Sai khu → đẩy đi
  }, [key, nav, admin]);
  if (!u || (admin ? u.role !== 'admin' : u.role === 'admin')) return null; // Không đủ quyền → không vẽ con
  return <Outlet />; // Đủ quyền → hiện các Route con bên trong
}

// Component mặc định export — toàn bộ cây route của app
export default function App() {
  useEffect(() => {
    if (!sessionStorage.getItem('library_member_id')) sessionStorage.setItem('library_member_id', '1'); // Giá trị demo/session
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/change-password" element={<ChangePassword />} />

      <Route element={<Guard admin={false} />}>
        <Route path="member" element={<MemberLayout />}>
          <Route index element={<MemberHome />} />
          <Route path="books" element={<MemberBooks />} />
          <Route path="books/:id" element={<MemberBookDetail />} />
          <Route path="borrowed" element={<MemberBorrowed />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="/member/pdf-viewer" element={<MemberPdfViewer />} />
        </Route>
      </Route>

{/* //  librarian      */}
      <Route element={<Guard admin />}>
        <Route path="librarian" element={<LibrarianLayout />}>
          <Route index element={<LibHome />} />
          <Route path="books" element={<LibBooks />} />
          <Route path="books/add" element={<LibAddBook />} />
          <Route path="books/edit/:id" element={<LibEditBook />} />
          <Route path="books/detail/:id" element={<LibBookDetail />} />
          <Route path="members" element={<LibMembers />} />
          <Route path="members/add" element={<LibAddMember />} />
          <Route path="members/edit/:id" element={<LibEditMember />} />
          <Route path="borrowings" element={<LibBorrowings />} />
          <Route path="borrowings/add" element={<LibAddBorrowing />} />
          <Route path="borrowings/edit/:id" element={<LibEditBorrowing />} />
          <Route path="reports" element={<LibReports />} />
          <Route path="/librarian/members/:id" element={<LibMemberDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
