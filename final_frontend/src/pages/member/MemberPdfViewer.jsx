import { useSearchParams, useNavigate } from 'react-router-dom';

export default function MemberPdfViewer() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Lấy URL pdf và tiêu đề từ link gửi sang
    const pdfUrl = searchParams.get('url');
    const title = searchParams.get('title');

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            {/* Thanh tiêu đề nội bộ của bạn */}
            <div style={{ 
                padding: '15px 20px', 
                background: '#1e293b', 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📖 Đang đọc: {title || 'Tài liệu'}</h2>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        background: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Thoát trình đọc
                </button>
            </div>

            {/* Nhúng PDF vào Iframe nội bộ */}
            {/* Nhúng PDF trực tiếp bằng trình duyệt (Xóa cái đoạn https://docs.google.com/gview... đi) */}
            {pdfUrl ? (
                <iframe
                    src={pdfUrl} 
                    style={{ flexGrow: 1, border: 'none', width: '100%' }}
                    title="PDF Viewer"
                />
            ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>Không tìm thấy tài liệu!</div>
            )}
        </div>
    );
}