// LibReports: /librarian/reports — GET U.stats (reports/stats)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { U } from '../../api/index.js';

/**
 * Báo cáo (`/librarian/reports`): GET `U.stats` (tổng sách, bạn đọc, phiếu, pending, overdue, …).
 * `daTra`: ước lượng số phiếu đã trả = `totalBorrowings - pending` (phụ thuộc backend trả đủ field).
 * Khi `stats` null và không lỗi: hiển thị “Đang tải…”.
 */
export default function LibReports() {
  const [stats, setStats] = useState(null); // Object từ GET U.stats hoặc null khi lỗi/đang tải
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(U.stats);
        if (!r.ok) throw new Error('fail');
        setStats(await r.json());
        setError(false);
      } catch {
        setError(true);
        setStats(null);
      }
    })();
  }, []);

  const d = stats || {};
  // Ước lượng số phiếu đã trả = tổng phiếu − số phiếu đang mượn (pending), nếu backend trả đủ field
  const daTra = (d.totalBorrowings ?? 0) - (d.pending ?? 0);

  return (
    <div className="container">
      <Link to="/librarian" className="btn-back">
        Quay lại
      </Link>
      <h1>Báo cáo</h1>
      <p className="reports-subtitle">Tổng quan thống kê thư viện</p>

      {/* 5 thẻ: sách, bạn đọc, tổng phiếu, đang mượn, quá hạn */}
      <div className="reports-stats" id="reports-stats">
        <div className="reports-row reports-row1">
          <div className="report-card card-books">
            <span className="report-icon" aria-hidden="true">
              📚
            </span>
            <div className="report-card-inner">
              <span className="label">Tổng sách</span>
              <span className="value" id="stat-books">
                {stats ? d.totalBooks : '–'}
              </span>
            </div>
          </div>
          <div className="report-card card-members">
            <span className="report-icon" aria-hidden="true">
              👤
            </span>
            <div className="report-card-inner">
              <span className="label">Tổng bạn đọc</span>
              <span className="value" id="stat-members">
                {stats ? d.totalMembers : '–'}
              </span>
            </div>
          </div>
          <div className="report-card card-borrowings">
            <span className="report-icon" aria-hidden="true">
              📋
            </span>
            <div className="report-card-inner">
              <span className="label">Tổng phiếu mượn</span>
              <span className="value" id="stat-borrowings">
                {stats ? d.totalBorrowings : '–'}
              </span>
            </div>
          </div>
        </div>
        <div className="reports-row reports-row2">
          <div className="report-card card-pending">
            <span className="report-icon" aria-hidden="true">
              ⏳
            </span>
            <div className="report-card-inner">
              <span className="label">Đang mượn</span>
              <span className="value" id="stat-pending">
                {stats ? d.pending : '–'}
              </span>
            </div>
          </div>
          <div className="report-card card-overdue">
            <span className="report-icon report-icon-warning" aria-hidden="true">
              ⚠️
            </span>
            <div className="report-card-inner">
              <span className="label">Sách quá hạn</span>
              <span className="value" id="stat-overdue">
                {stats ? d.overdue : '–'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="reports-section">
        <h2>Tổng quan</h2>
        <div className="report-summary-box" id="report-summary">
          {error && <span style={{ color: 'red' }}>Không thể kết nối Server để lấy báo cáo!</span>}
          {!error && !stats && <span className="reports-loading">Đang tải...</span>}
          {!error && stats && (
            <div style={{ lineHeight: 1.8 }}>
              • <strong>Tổng kho sách:</strong> {d.totalBooks} cuốn
              <br />• <strong>Số lượng bạn đọc:</strong> {d.totalMembers} thành viên
              <br />• <strong>Tình trạng mượn trả:</strong> Tổng {d.totalBorrowings} phiếu (
              <span style={{ color: 'blue' }}>{d.pending} đang mượn</span>,{' '}
              <span style={{ color: 'green' }}>{daTra} đã trả</span>)<br />• <strong>Cảnh báo:</strong>{' '}
              <span style={{ color: 'red', fontWeight: 'bold' }}>{d.overdue} sách quá hạn</span> cần thu hồi.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
