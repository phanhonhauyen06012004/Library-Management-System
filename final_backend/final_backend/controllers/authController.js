const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Xóa chữ 'js' đi cho đồng bộ với file kia

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const isStrongPassword = (password) => {
    return password.length > 6 && /[A-Z]/.test(password) && /\d/.test(password);
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Chặn ngay nếu để trống
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu!' });
        }

        // 2. Tìm User trong Database
        const [users] = await db.query('SELECT * FROM members WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
        }

        const user = users[0];

        // 3. Kiểm tra trạng thái khóa (Không cho đăng nhập nếu bị khóa)
        if (user.status === 'Bị khóa') {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa!' });
        }

        // 4. KIỂM TRA MẬT KHẨU NGHIÊM NGẶT
        // 4. KIỂM TRA MẬT KHẨU NGHIÊM NGẶT
        let isMatch = false;

        // Nếu có chuỗi băm (Bắt đầu bằng $2b$...) thì dùng bcrypt
        if (user.password_hash && user.password_hash.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(String(password), user.password_hash);
        } 
        // Nếu không có chuỗi băm, hoặc chuỗi băm trống/NULL -> Chấp nhận pass 123456 hoặc khớp thẳng
        else {
            const rawDbPass = user.password_hash || '123456'; 
            isMatch = (String(password) === String(rawDbPass));
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu!' });
        }

        // 5. PHÂN QUYỀN CHÍNH XÁC (Khắc phục lỗi Admin thành Member)
        let role = 'member';
        
        // Dùng == (2 dấu bằng) thay vì === để tránh lỗi chuỗi '1' vs số 1
        // Kết hợp check cứng email Admin đề phòng trường hợp DB cấu hình sai role_id
        if (user.role_id == 1 || user.email === 'admin@email.com') {
            role = 'admin';
        }

        // 6. Cấp thẻ thông hành (Token)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // 7. Trả kết quả về cho Frontend
        return res.json({
            message: 'Đăng nhập thành công',
            token: token,
            user: { 
                id: user.id, 
                name: user.name,
                email: user.email, 
                role: role // Trả về chính xác 'admin' hoặc 'member'
            }
        });

        

    } catch (error) {
        console.error("LỖI ĐĂNG NHẬP (BACKEND):", error);
        return res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
    
};


exports.changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
    }

    // Giả sử bạn đã định nghĩa hàm isStrongPassword ở đâu đó trong file
    if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ message: 'Mật khẩu phải lớn hơn 6 ký tự, chứa ít nhất 1 chữ in hoa và 1 chữ số!' });
    }

    try {
        const [users] = await db.query('SELECT * FROM members WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'Tài khoản không tồn tại!' });

        const user = users[0];
        
        // --- BẮT ĐẦU ĐOẠN SỬA ---
        let isMatch = false;
        if (user.password_hash && user.password_hash.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(String(oldPassword), user.password_hash);
        } else {
            const rawDbPass = user.password_hash || '123456'; 
            isMatch = (String(oldPassword) === String(rawDbPass));
        }
        // --- KẾT THÚC ĐOẠN SỬA ---

        if (!isMatch) return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác!' });

        const hashedNewPass = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE members SET password_hash = ? WHERE email = ?', [hashedNewPass, email]);

        return res.json({ message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (error) {
        console.error("LỖI ĐỔI MẬT KHẨU:", error);
        return res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
};

// ==========================================
// API 2: YÊU CẦU QUÊN MẬT KHẨU (Gửi OTP về Gmail)
// ==========================================
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập Email!' });

    try {
        const [users] = await db.query('SELECT * FROM members WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'Email này chưa được đăng ký!' });

        // Tạo mã OTP 6 số ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set thời gian sống của OTP là 10 phút
        const expires = new Date(Date.now() + 10 * 60000); 

        // Lưu OTP vào DB
        await db.query('UPDATE members SET reset_otp = ?, otp_expires = ? WHERE email = ?', [otp, expires, email]);

        // Gửi mail
        const mailOptions = {
            from: 'luubao952004@gmail.com',
            to: email,
            subject: 'Mã xác nhận khôi phục mật khẩu - Library Management',
            html: `<h3>Xin chào!</h3>
                   <p>Bạn vừa yêu cầu đặt lại mật khẩu. Đây là mã xác nhận (OTP) của bạn:</p>
                   <h2 style="color: blue;">${otp}</h2>
                   <p>Mã này sẽ hết hạn sau 10 phút. Tuyệt đối không chia sẻ mã này cho người khác.</p>`
        };

        await transporter.sendMail(mailOptions);
        return res.json({ message: 'Mã xác nhận đã được gửi đến Email của bạn!' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi gửi email xác nhận!' });
    }
};

// ==========================================
// API 3: XÁC NHẬN OTP VÀ ĐẶT LẠI MẬT KHẨU
// ==========================================
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Vui lòng điền đủ thông tin!' });

    if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ message: 'Mật khẩu phải lớn hơn 6 ký tự, chứa ít nhất 1 chữ in hoa và 1 chữ số!' });
    }

    try {
        const [users] = await db.query('SELECT * FROM members WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'Tài khoản không tồn tại!' });

        const user = users[0];

        // Kiểm tra OTP có khớp và còn hạn không
        if (user.reset_otp !== otp) {
            return res.status(400).json({ message: 'Mã OTP không chính xác!' });
        }
        if (new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn! Vui lòng gửi lại yêu cầu.' });
        }

        // Cập nhật mật khẩu mới và xóa mã OTP đi
        const hashedNewPass = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE members SET password_hash = ?, reset_otp = NULL, otp_expires = NULL WHERE email = ?', [hashedNewPass, email]);

        return res.json({ message: 'Khôi phục mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
};