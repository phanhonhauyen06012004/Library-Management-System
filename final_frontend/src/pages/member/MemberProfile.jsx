// MemberProfile: /member/profile — GET/PUT hồ sơ (Bearer token), modal sửa tên + SĐT
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../api/index.js';

const profileUrl = apiUrl('users/profile'); // GET/PUT /api/users/profile

/**
 * Đọc hồ sơ người dùng đã đăng nhập (JWT).
 * @returns {Promise<{ ok: boolean, err: string, user: object | null }>}
 *   - `err === 'login'`: không có token.
 *   - `err === 'net'`: lỗi mạng / fetch.
 *   - `ok && user`: payload từ API (vd. `full_name`, `phone`, `email`, `code`).
 */
async function fetchProfile() {
  const token = localStorage.getItem('token'); // JWT sau login
  if (!token) return { ok: false, err: 'login', user: null }; // Chưa có token
  try {
    const response = await fetch(profileUrl, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (response.ok) return { ok: true, err: '', user: data };
    return { ok: false, err: data.message || 'Lỗi', user: null };
  } catch {
    return { ok: false, err: 'net', user: null }; // Lỗi mạng
  }
}

/**
 * Hồ sơ cá nhân (`/member/profile`).
 *
 * `errMsg` + `user`: render nhánh — login / lỗi mạng / lỗi message / đang tải / thẻ hồ sơ.
 * Modal: chỉnh `full_name`, `phone` qua PUT; đóng khi click nền `#editModal` hoặc Hủy; `stopPropagation` trên nội dung.
 */
export default function MemberProfile() {
  const [user, setUser] = useState(null); // dữ liệu từ API
  const [errMsg, setErrMsg] = useState(''); // 'login' | 'net' | message | ''
  const [modalOpen, setModalOpen] = useState(false); // cửa sổ sửa hồ sơ
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetchProfile();
      setErrMsg(r.err);
      setUser(r.user);
    })();
  }, []);

  /** Điền `editName` / `editPhone` từ `user` và mở modal (không mở nếu chưa có `user`). */
  function openModal() {
    if (!user) return;
    setEditName(user.full_name || '');
    setEditPhone(user.phone || '');
    setModalOpen(true);
  }

  /**
   * Submit form modal: PUT `profileUrl` với `{ full_name, phone }`, header Bearer.
   * Sau khi OK: đóng modal, gọi lại `fetchProfile()` để đồng bộ state.
   */
  async function handleSubmitEdit(e) {
    e.preventDefault(); // Không reload trang
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(profileUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: editName, phone: editPhone })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Cập nhật hồ sơ thành công!');
        setModalOpen(false);
        const r = await fetchProfile(); // Tải lại từ server
        setErrMsg(r.err);
        setUser(r.user);
      } else alert('Lỗi: ' + (data.message || 'Không thể cập nhật hồ sơ.'));
    } catch {
      alert('Lỗi kết nối đến máy chủ!');
    }
  }

  let containerInner; // Nội dung khối profile — tùy errMsg / user
  if (errMsg === 'login') {
    containerInner = (
      <div className="profile-card" style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>
        Vui lòng đăng nhập để xem thông tin!
      </div>
    );
  } else if (errMsg === 'net') {
    containerInner = (
      <div className="profile-card" style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>
        Mất kết nối với máy chủ!
      </div>
    );
  } else if (errMsg && user === null) {
    containerInner = (
      <div className="profile-card" style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>
        Lỗi: {errMsg}
      </div>
    );
  } else if (!user) {
    containerInner = (
      <div className="profile-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Đang tải thông tin...
      </div>
    );
  } else {
    const ch = user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';
    containerInner = (
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{ch}</div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>{user.full_name || 'Chưa cập nhật tên'}</h2>
          <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Thành viên Thư viện</p>
        </div>
        <div className="profile-body">
          <div className="info-row">
            <span className="info-label">Mã thành viên</span>
            <span className="info-value">{user.code || '---'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email || '---'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Số điện thoại</span>
            <span className="info-value">{user.phone || 'Chưa cập nhật'}</span>
          </div>
          <div className="profile-actions">
            <button type="button" className="btn-profile btn-edit" onClick={openModal}>
              Cập nhật hồ sơ
            </button>
            <Link to="/auth/change-password" className="btn-profile btn-change-pass">
              Đổi mật khẩu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container user-ui">
      <Link to="/member" className="btn-back">
        Quay lại
      </Link>
      <h1 style={{ marginBottom: '10px', color: '#0f172a' }}>Hồ sơ cá nhân</h1>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>Quản lý thông tin và bảo mật tài khoản của bạn.</p>
      <div id="profile-container">{containerInner}</div>

      {/* Click lớp nền (editModal) đóng modal; click nội dung không bubble ra nền */}
      <div id="editModal" className={`modal ${modalOpen ? 'open' : ''}`} onClick={(e) => e.target.id === 'editModal' && setModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>Cập nhật thông tin</h3>
          <form id="editProfileForm" onSubmit={handleSubmitEdit}>
            <div className="form-group">
              <label htmlFor="editName">Họ và tên</label>
              <input id="editName" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="editPhone">Số điện thoại</label>
              <input id="editPhone" type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="09xxxxxxx" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>
                Hủy
              </button>
              <button type="submit" className="btn-save">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
