-- ============================================================
-- LIBRARY MANAGEMENT — schema + sample data (merged)
-- Dùng cho project: New Programming Language_Final
-- Trong .env đặt: DB_NAME=library_management
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

DROP TABLE IF EXISTS `borrowings`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `categories`;

-- ------------------------------------------------------------
-- Thể loại
-- ------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Vai trò (Admin / User) — dùng bởi auth + memberController
-- ------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'Admin'),
(2, 'User');

-- ------------------------------------------------------------
-- Bạn đọc (đăng nhập, OTP quên mật khẩu)
-- ------------------------------------------------------------
CREATE TABLE `members` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('Hoạt động','Bị khóa') NOT NULL DEFAULT 'Hoạt động',
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'bcrypt; NULL + mật khẩu 123456 trong auth',
  `role_id` INT UNSIGNED DEFAULT NULL,
  `reset_otp` VARCHAR(10) DEFAULT NULL,
  `otp_expires` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_members_code` (`code`),
  UNIQUE KEY `uk_members_email` (`email`),
  CONSTRAINT `fk_members_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Sách (có image cho bookController)
-- ------------------------------------------------------------
CREATE TABLE `books` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `author` VARCHAR(100) DEFAULT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `publish_year` CHAR(4) DEFAULT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('Có sẵn','Đang mượn') NOT NULL DEFAULT 'Có sẵn',
  `image` VARCHAR(500) DEFAULT NULL,
  `pdf_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_books_code` (`code`),
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Phiếu mượn (workflow duyệt + mã xác nhận)
-- ------------------------------------------------------------
CREATE TABLE `borrowings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `borrow_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE DEFAULT NULL COMMENT 'NULL = chưa trả',
  `status` ENUM('Chờ duyệt','Đang mượn','Đã trả','Từ chối') NOT NULL DEFAULT 'Chờ duyệt',
  `verification_code` VARCHAR(10) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_borrowings_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_borrowings_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `idx_borrowings_member` (`member_id`),
  KEY `idx_borrowings_book` (`book_id`),
  KEY `idx_borrowings_return` (`return_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Kỹ năng'), (2, 'Văn học'), (3, 'Lập trình'), (4, 'Kinh tế'), (5, 'Lịch sử'),
(6, 'Khoa học'), (7, 'Thiếu nhi'), (8, 'Y học - Sức khỏe'), (9, 'Triết học'), (10, 'Ngoại ngữ'),
(11, 'Nghệ thuật - Âm nhạc'), (12, 'Du lịch - Địa lý'), (13, 'Tâm lý học'), (14, 'Công nghệ'), (15, 'Giáo dục'),
(16, 'Chính trị - Xã hội'), (17, 'Pháp luật'), (18, 'Thể thao'), (19, 'Ẩm thực - Nấu ăn'), (20, 'Làm vườn - Nông nghiệp'),
(21, 'Kiến trúc - Xây dựng'), (22, 'Thiết kế - Đồ họa'), (23, 'Marketing - Bán hàng'), (24, 'Quản trị - Leadership'), (25, 'Tôn giáo'),
(26, 'Truyện tranh - Manga'), (27, 'Trinh thám - Hồi hộp'), (28, 'Khoa học viễn tưởng'), (29, 'Thơ ca'), (30, 'Kịch - Kịch bản'),
(31, 'Tiểu sử - Hồi ký'), (32, 'Văn hóa - Phong tục'), (33, 'Môi trường - Sinh thái'), (34, 'Toán học'), (35, 'Vật lý'),
(36, 'Hóa học'), (37, 'Sinh học'), (38, 'Thiên văn học'), (39, 'Cơ khí - Kỹ thuật'), (40, 'Điện - Điện tử'),
(41, 'Mỹ thuật - Hội họa'), (42, 'Nhiếp ảnh'), (43, 'Thời trang'), (44, 'Cổ tích - Dân gian'), (45, 'Từ điển - Bách khoa');

INSERT INTO `members` (`id`, `code`, `name`, `email`, `phone`, `status`, `password_hash`, `role_id`) VALUES
(1, 'BD001', 'Nguyễn Văn A', 'a@email.com', '0901234567', 'Hoạt động', NULL, 2),
(2, 'BD002', 'Trần Thị B', 'b@email.com', '0912345678', 'Bị khóa', NULL, 2),
(3, 'BD003', 'Lê Văn C', 'c@email.com', '0923456789', 'Hoạt động', NULL, 2),
(4, 'BD004', 'Phạm Thị D', 'd@email.com', '0934567890', 'Hoạt động', NULL, 2),
(5, 'BD005', 'Hoàng Văn E', 'e@email.com', '0945678901', 'Hoạt động', NULL, 2),
(6, 'BD006', 'Phan Thị F', 'f@email.com', '0956789012', 'Hoạt động', NULL, 2),
(7, 'BD007', 'Vũ Văn G', 'g@email.com', '0967890123', 'Bị khóa', NULL, 2),
(8, 'BD008', 'Đặng Thị H', 'h@email.com', '0978901234', 'Hoạt động', NULL, 2),
(9, 'BD009', 'Bùi Văn K', 'k@email.com', '0989012345', 'Hoạt động', NULL, 2),
(10, 'BD010', 'Đỗ Thị L', 'l@email.com', '0990123456', 'Hoạt động', NULL, 2),
(11, 'BD011', 'Nông Văn M', 'm@email.com', '0901234568', 'Hoạt động', NULL, 2),
(12, 'BD012', 'Lý Thị N', 'n@email.com', '0912345679', 'Hoạt động', NULL, 2),
(13, 'BD013', 'Trương Văn P', 'p@email.com', '0923456780', 'Hoạt động', NULL, 2),
(14, 'BD014', 'Dương Thị Q', 'q@email.com', '0934567891', 'Bị khóa', NULL, 2),
(15, 'BD015', 'Tạ Văn R', 'r@email.com', '0945678902', 'Hoạt động', NULL, 2),
(16, 'BD016', 'Hồ Thị S', 's@email.com', '0956789013', 'Hoạt động', NULL, 2),
(17, 'BD017', 'Mai Văn T', 't@email.com', '0967890124', 'Hoạt động', NULL, 2),
(18, 'BD018', 'Chu Thị U', 'u@email.com', '0978901235', 'Hoạt động', NULL, 2),
(19, 'BD019', 'Lâm Văn V', 'v@email.com', '0989012346', 'Hoạt động', NULL, 2),
(20, 'BD020', 'Tô Thị X', 'x@email.com', '0990123457', 'Hoạt động', NULL, 2),
(21, 'BD021', 'Hà Văn Y', 'y@email.com', '0901234569', 'Hoạt động', NULL, 2),
(22, 'BD022', 'Kim Thị Z', 'z@email.com', '0912345680', 'Hoạt động', NULL, 2),
(23, 'BD023', 'Cao Văn Minh', 'minh@email.com', '0923456781', 'Hoạt động', NULL, 2);

INSERT INTO `members` (`code`, `name`, `email`, `phone`, `status`, `password_hash`, `role_id`) VALUES
('ADM001', 'Admin Tổng', 'admin@email.com', '123456', 'Hoạt động', NULL, 1);

INSERT INTO `books` (`id`, `code`, `title`, `author`, `category_id`, `publish_year`, `quantity`, `status`, `pdf_url`) VALUES
(1, 'S001', 'Đắc Nhân Tâm', 'Dale Carnegie', 1, '1936', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(2, 'S002', 'Nhà Giả Kim', 'Paulo Coelho', 2, '1988', 3, 'Đang mượn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(3, 'S003', 'JavaScript Cơ bản', 'Nhiều tác giả', 3, '2020', 10, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(4, 'S004', 'Clean Code', 'Robert C. Martin', 3, '2008', 2, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(5, 'S005', 'Nghĩ giàu làm giàu', 'Napoleon Hill', 4, '1937', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(6, 'S006', 'Lịch sử Việt Nam', 'Nhiều tác giả', 5, '2015', 6, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(7, 'S007', 'Vũ trụ trong vỏ hạt dẻ', 'Stephen Hawking', 6, '2001', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(8, 'S008', 'Doraemon', 'Fujiko F. Fujio', 7, '1969', 20, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(9, 'S009', 'Sống khỏe mỗi ngày', 'BS. Nguyễn Văn X', 8, '2022', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(10, 'S010', 'Nhập môn triết học phương Tây', 'Bertrand Russell', 9, '1945', 2, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(11, 'S011', 'English Grammar in Use', 'Raymond Murphy', 10, '2019', 8, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(12, 'S012', 'Lịch sử âm nhạc thế giới', 'Nhiều tác giả', 11, '2018', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(13, 'S013', 'Cẩm nang du lịch Việt Nam', 'Lonely Planet', 12, '2023', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(14, 'S014', 'Tâm lý học đám đông', 'Gustave Le Bon', 13, '1895', 2, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(15, 'S015', 'Trí tuệ nhân tạo', 'Stuart Russell', 14, '2020', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(16, 'S016', 'Phương pháp giáo dục Montessori', 'Maria Montessori', 15, '1949', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(17, 'S017', 'Tôi tài giỏi bạn cũng thế', 'Adam Khoo', 1, '2009', 7, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(18, 'S018', 'Sapiens', 'Yuval Noah Harari', 6, '2011', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(19, 'S019', 'Harry Potter và Hòn đá phù thủy', 'J.K. Rowling', 2, '1997', 6, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(20, 'S020', 'Python Crash Course', 'Eric Matthes', 3, '2019', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(21, 'S021', 'Bản chất dân chủ', 'Nhiều tác giả', 16, '2019', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(22, 'S022', 'Luật dân sự Việt Nam', 'Bộ Tư pháp', 17, '2022', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(23, 'S023', 'Bóng đá - Chiến thuật và kỹ năng', 'Pep Guardiola', 18, '2021', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(24, 'S024', 'Nghệ thuật ẩm thực Việt', 'Nguyễn Dzoãn Cẩm Vân', 19, '2020', 6, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(25, 'S025', 'Trồng rau sạch tại nhà', 'Nhiều tác giả', 20, '2023', 8, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(26, 'S026', 'Kiến trúc hiện đại thế giới', 'Philip Jodidio', 21, '2018', 2, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(27, 'S027', 'Thiết kế UI/UX', 'Don Norman', 22, '2013', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(28, 'S028', 'Marketing 4.0', 'Philip Kotler', 23, '2016', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(29, 'S029', 'Nhà lãnh đạo không chức danh', 'Robin Sharma', 24, '2010', 6, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(30, 'S030', 'Lịch sử các tôn giáo', 'Karen Armstrong', 25, '1993', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(31, 'S031', 'One Piece', 'Oda Eiichiro', 26, '1997', 15, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(32, 'S032', 'Sherlock Holmes', 'Arthur Conan Doyle', 27, '1887', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(33, 'S033', 'Dune', 'Frank Herbert', 28, '1965', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(34, 'S034', 'Tuyển tập thơ Hồ Xuân Hương', 'Hồ Xuân Hương', 29, '1800', 2, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(35, 'S035', 'Romeo và Juliet', 'William Shakespeare', 30, '1597', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(36, 'S036', 'Steve Jobs', 'Walter Isaacson', 31, '2011', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(37, 'S037', 'Văn hóa Việt Nam', 'Phan Ngọc', 32, '1998', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(38, 'S038', 'Biến đổi khí hậu', 'Nhiều tác giả', 33, '2021', 6, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(39, 'S039', 'Toán cao cấp', 'Nguyễn Đình Trí', 34, '2019', 7, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(40, 'S040', 'Vật lý đại cương', 'David Halliday', 35, '2010', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(41, 'S041', 'Hóa học hữu cơ', 'John McMurry', 36, '2015', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(42, 'S042', 'Sinh học phân tử', 'James Watson', 37, '2007', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(43, 'S043', 'Thiên văn học nhập môn', 'Neil deGrasse Tyson', 38, '2017', 4, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(44, 'S044', 'Cơ khí đại cương', 'Nhiều tác giả', 39, '2020', 5, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(45, 'S045', 'Điện tử công suất', 'Muhammad Rashid', 40, '2018', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(46, 'S046', 'Lịch sử hội họa', 'Ernst Gombrich', 41, '1950', 2, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(47, 'S047', 'Nhiếp ảnh số', 'Scott Kelby', 42, '2022', 6, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(48, 'S048', 'Lịch sử thời trang', 'Cally Blackman', 43, '2012', 3, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(49, 'S049', 'Truyện cổ Grimm', 'Anh em Grimm', 44, '1812', 10, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
(50, 'S050', 'Bách khoa toàn thư Việt Nam', 'Nhiều tác giả', 45, '2020', 2, 'Có sẵn', 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');

INSERT INTO `borrowings` (`id`, `member_id`, `book_id`, `borrow_date`, `due_date`, `return_date`, `status`, `verification_code`) VALUES
(1, 1, 2, '2025-03-01', '2025-03-15', NULL, 'Đang mượn', 'DEMO01'),
(2, 2, 1, '2025-03-10', '2025-03-24', '2025-03-12', 'Đã trả', NULL),
(3, 1, 3, '2025-03-05', '2025-03-19', NULL, 'Đang mượn', 'DEMO02');

-- Khớp tồn kho với 2 phiếu trạng thái Đang mượn (sách id 2 và 3)
UPDATE `books` SET `quantity` = `quantity` - 1 WHERE `id` IN (2, 3);
