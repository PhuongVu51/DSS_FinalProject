-- 1. Tạo bảng dành riêng cho Nhà sản xuất / Admin
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    role VARCHAR(50) DEFAULT '🏭 Nhà Sản Xuất (Chủ Tiệm)'
);

-- 2. Tạo bảng dành riêng cho Khách hàng / Người trải nghiệm
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    role VARCHAR(50) DEFAULT '😋 Người Trải Nghiệm (Khách Hàng)'
);

-- Thêm dữ liệu tài khoản mẫu vào 2 bảng riêng biệt
INSERT IGNORE INTO admins (username, password, fullname) 
VALUES ('admin', 'admin123', 'Chủ tiệm Jolista');

INSERT IGNORE INTO customers (username, password, fullname)
VALUES ('khachhang', 'khach123', 'Khách hàng Jolista');
VALUES ('khachhang1', 'khach123', 'Khách hàng 1');
VALUES ('khachhang2', 'khach123', 'Khách hàng 2');      
VALUES ('khachhang3', 'khach123', 'Khách hàng 3');
VALUES ('khachhang4', 'khach123', 'Khách hàng 4');
VALUES ('khachhang5', 'khach123', 'Khách hàng 5');
VALUES ('khachhang6', 'khach123', 'Khách hàng 6');
VALUES ('khachhang7', 'khach123', 'Khách hàng 7');
VALUES ('khachhang8', 'khach123', 'Khách hàng 8');
VALUES ('khachhang9', 'khach123', 'Khách hàng 9');
VALUES ('khachhang10', 'khach123', 'Khách hàng 10');


