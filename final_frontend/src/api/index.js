// ---------------------------------------------------------------------------
// api/index.js — Cấu hình URL backend + hàm dùng chung (date, user, lỗi JSON)
// Biến môi trường: VITE_API_BASE trong file .env của final_frontend
// ---------------------------------------------------------------------------

// Object chứa chuỗi base API; import.meta.env là biến do Vite inject lúc build
export const CONFIG = { API_BASE: import.meta.env.VITE_API_BASE || 'https://library-backend-api-3xcu.onrender.com/api' };

// Hàm nối base + đường con; p có hoặc không có dấu / đầu đều được
export function apiUrl(p) {
  return CONFIG.API_BASE + (p.startsWith('/') ? p : '/' + p);
}

// Object tiện ích: mỗi field là URL đầy đủ — tránh gõ apiUrl() lặp lại
export const U = {
  books: apiUrl('books'), // REST sách
  members: apiUrl('members'), // REST bạn đọc
  borrowings: apiUrl('borrowings'), // REST phiếu mượn
  stats: apiUrl('reports/stats') // Báo cáo thống kê
};

// Đọc body JSON của Response; lỗi parse → {}
export async function docLoi(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// Cắt chuỗi ISO datetime thành phần ngày YYYY-MM-DD
export function chiNgay(x) {
  return x ? String(x).split('T')[0] : '';
}

// Trả chuỗi ngày hôm nay YYYY-MM-DD (chuẩn input type="date")
export const homNay = () => new Date().toISOString().split('T')[0];

// Cộng n ngày kể từ hôm nay → YYYY-MM-DD
export function sauNgay(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// Đọc object user từ localStorage key 'user'; lỗi JSON → null
export function getUser() {
  try {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
