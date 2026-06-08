-- ==========================================
-- 1. DIM_DIA_CHI (Bảng mới theo xử lý của Backend)
-- ==========================================
CREATE TABLE DIM_DIA_CHI (
    DiaChiKey INT IDENTITY(1,1) PRIMARY KEY,
    Tinh NVARCHAR(100) NOT NULL,
    Huyen NVARCHAR(100) NOT NULL
);
GO


CREATE TABLE DIM_SAN_PHAM (
    SanPhamKey INT IDENTITY(1,1) PRIMARY KEY, -- Khóa chính tự tăng trong DW
    SanPhamID INT,                           -- Mã ID sản phẩm gốc từ nguồn
    TenSanPham NVARCHAR(200),
    Gia DECIMAL(18,2),
    ConHang BIT,
        
    -- Thông tin cấu hình chi tiết mới thêm
    MauSac NVARCHAR(50),                     -- Ví dụ: N'Đen Titan', N'Trắng Bạc'
    RAM VARCHAR(50),                         -- Ví dụ: '8GB', '16GB' (hoặc dùng INT nếu chỉ lưu số)
    ROM VARCHAR(50),                         -- Ví dụ: '128GB', '1TB'
        
    -- Thông tin hãng sản xuất (Gộp từ bảng Hang sang chuẩn Dim)
    HangID INT,              
    TenHang NVARCHAR(100),
    MoTaHang NVARCHAR(500)  
);
GO


CREATE TABLE DIM_KHACH_HANG (
    KhachHangKey INT IDENTITY(1,1) PRIMARY KEY,
    KhachHangID INT, 
    HoTen NVARCHAR(100),
    Email NVARCHAR(100),
    SoDienThoai NVARCHAR(20)
    -- Đã bỏ trường địa chỉ ở đây vì địa chỉ giờ đi theo từng Đơn hàng (Fact)
);
GO

CREATE TABLE DIM_STATUS_ORDER (
    StatusKey INT IDENTITY(1,1) PRIMARY KEY,
    TrangThai NVARCHAR(50) NOT NULL
);
GO

CREATE TABLE DIM_THOI_GIAN (
    TimeKey INT PRIMARY KEY, 
    Ngay DATE NOT NULL,
    NgayTrongThang INT,
    Thang INT,
    Quy INT,
    Nam INT,
    Tuan INT,
    ThuTrongTuan INT,
    TenThu NVARCHAR(20)
);
GO


CREATE TABLE FACT_DON_HANG (
    FactKey BIGINT IDENTITY(1,1) PRIMARY KEY,
    DonHangID INT, 

    TimeKey INT NOT NULL,
    StatusKey INT NOT NULL,
    SanPhamKey INT NOT NULL,
    KhachHangKey INT NOT NULL,
    DiaChiKey INT NOT NULL,

    SoLuong INT NOT NULL,
    DonGia DECIMAL(18,2) NOT NULL,
    DoanhThu AS (SoLuong * DonGia), 

    CONSTRAINT FK_FACT_TIME FOREIGN KEY (TimeKey) REFERENCES DIM_THOI_GIAN(TimeKey),
    CONSTRAINT FK_FACT_STATUS FOREIGN KEY (StatusKey) REFERENCES DIM_STATUS_ORDER(StatusKey),
    CONSTRAINT FK_FACT_SANPHAM FOREIGN KEY (SanPhamKey) REFERENCES DIM_SAN_PHAM(SanPhamKey),
    CONSTRAINT FK_FACT_KHACHHANG FOREIGN KEY (KhachHangKey) REFERENCES DIM_KHACH_HANG(KhachHangKey),
    CONSTRAINT FK_FACT_DIACHI FOREIGN KEY (DiaChiKey) REFERENCES DIM_DIA_CHI(DiaChiKey)
);
GO