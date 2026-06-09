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

-- 3. Tạo bảng sản phẩm
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_path VARCHAR(255),
    ingredients JSON
);

-- 4. Tạo bảng phản hồi khách hàng
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    region VARCHAR(100),
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm dữ liệu tài khoản mẫu vào 2 bảng riêng biệt
INSERT IGNORE INTO admins (username, password, fullname) 
VALUES ('admin', 'admin123', 'Chủ tiệm Jolista');

INSERT IGNORE INTO customers (username, password, fullname)
VALUES 
('khachhang', 'khach123', 'Khách hàng Jolista'),
('khachhang1', 'khach123', 'Khách hàng 1'),
('khachhang2', 'khach123', 'Khách hàng 2'),      
('khachhang3', 'khach123', 'Khách hàng 3'),
('khachhang4', 'khach123', 'Khách hàng 4'),
('khachhang5', 'khach123', 'Khách hàng 5'),
('khachhang6', 'khach123', 'Khách hàng 6'),
('khachhang7', 'khach123', 'Khách hàng 7'),
('khachhang8', 'khach123', 'Khách hàng 8'),
('khachhang9', 'khach123', 'Khách hàng 9'),
('khachhang10', 'khach123', 'Khách hàng 10');
