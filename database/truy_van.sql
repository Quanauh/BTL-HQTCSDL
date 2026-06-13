-- QUERY 1: DOANH THU THEO THÁNG / QUÝ / NĂM (ROLLUP)
SELECT
    CASE WHEN GROUPING(t.Nam) = 1 THEN N'Tổng cộng'
         ELSE CAST(t.Nam AS NVARCHAR(10)) END AS Nam,
    CASE WHEN GROUPING(t.Quy) = 1 THEN N'Tất cả'
         ELSE N'Q' + CAST(t.Quy AS NVARCHAR(5)) END AS Quy,
    CASE WHEN GROUPING(t.Thang) = 1 THEN N'Tất cả'
         ELSE CAST(t.Thang AS NVARCHAR(5)) END AS Thang,
    COUNT(DISTINCT f.DonHangID) AS SoDonHang,
    SUM(f.SoLuong) AS TongSoLuong,
    SUM(f.DoanhThu) AS TongDoanhThu
FROM FACT_DON_HANG f
JOIN DIM_THOI_GIAN t ON f.TimeKey = t.TimeKey
JOIN DIM_STATUS_ORDER s ON f.StatusKey = s.StatusKey
WHERE s.TrangThai = N'đã giao'   -- Chỉ tính đơn hoàn thành
GROUP BY ROLLUP(t.Nam, t.Quy, t.Thang)
ORDER BY t.Nam, t.Quy, t.Thang;


-- QUERY 2: TOP 10 SẢN PHẨM BÁN CHẠY NHẤT
SELECT TOP 10
    sp.TenSanPham,
    sp.TenHang,
    sp.MauSac,
    sp.RAM,
    sp.ROM,
    SUM(f.SoLuong)  AS TongSoLuongBan,
    SUM(f.DoanhThu) AS TongDoanhThu,
    RANK() OVER (ORDER BY SUM(f.SoLuong) DESC) AS XepHangSanLuong
FROM FACT_DON_HANG f
JOIN DIM_SAN_PHAM sp ON f.SanPhamKey = sp.SanPhamKey
JOIN DIM_STATUS_ORDER s ON f.StatusKey = s.StatusKey
WHERE s.TrangThai = N'đã giao'
GROUP BY
    sp.SanPhamKey, sp.TenSanPham, sp.TenHang,
    sp.MauSac, sp.RAM, sp.ROM
ORDER BY TongSoLuongBan DESC;


-- QUERY 3: DOANH THU THEO TỈNH VÀ HÃNG (GROUPING SETS)
SELECT
    ISNULL(d.Tinh, N'(Tất cả tỉnh)') AS Tinh,
    ISNULL(sp.TenHang, N'(Tất cả hãng)') AS TenHang,
    COUNT(DISTINCT f.DonHangID) AS SoDonHang,
    SUM(f.DoanhThu) AS TongDoanhThu
FROM FACT_DON_HANG f
JOIN DIM_DIA_CHI d ON f.DiaChiKey = d.DiaChiKey
JOIN DIM_SAN_PHAM sp ON f.SanPhamKey = sp.SanPhamKey
JOIN DIM_STATUS_ORDER s ON f.StatusKey = s.StatusKey
WHERE s.TrangThai = N'đã giao'
GROUP BY GROUPING SETS (
    (d.Tinh, sp.TenHang),   -- Chi tiết: từng tỉnh × từng hãng
    (d.Tinh),               
    (sp.TenHang),           
    ()                      -- Tất cả các tỉnh
)
ORDER BY d.Tinh, sp.TenHang;


-- QUERY 4: RANK SẢN PHẨM THEO TỪNG HÃNG
WITH DoanhThuSanPham AS (
    SELECT
        sp.TenHang,
        sp.TenSanPham,
        sp.MauSac,
        sp.RAM,
        sp.ROM,
        SUM(f.SoLuong) AS TongSoLuong,
        SUM(f.DoanhThu) AS TongDoanhThu
    FROM FACT_DON_HANG f
    JOIN DIM_SAN_PHAM sp ON f.SanPhamKey = sp.SanPhamKey
    JOIN DIM_STATUS_ORDER s ON f.StatusKey = s.StatusKey
    WHERE s.TrangThai = N'đã giao'
    GROUP BY
        sp.SanPhamKey, sp.TenHang, sp.TenSanPham,
        sp.MauSac, sp.RAM, sp.ROM
)
SELECT
    TenHang,
    TenSanPham,
    MauSac,
    RAM,
    ROM,
    TongSoLuong,
    TongDoanhThu,
    RANK() OVER (PARTITION BY TenHang ORDER BY TongDoanhThu DESC) AS XepHangTrongHang,
    DENSE_RANK() OVER (ORDER BY TongDoanhThu DESC) AS XepHangToanBo
FROM DoanhThuSanPham
ORDER BY TenHang, XepHangTrongHang;


-- QUERY 5: SO SÁNH DOANH THU THÁNG HIỆN TẠI VỚI THÁNG TRƯỚC
WITH DoanhThuThang AS (
    SELECT
        t.Nam,
        t.Thang,
        SUM(f.DoanhThu) AS DoanhThuThang
    FROM FACT_DON_HANG f
    JOIN DIM_THOI_GIAN t ON f.TimeKey = t.TimeKey
    JOIN DIM_STATUS_ORDER s ON f.StatusKey = s.StatusKey
    WHERE s.TrangThai = N'đã giao'
    GROUP BY t.Nam, t.Thang
)
SELECT
    Nam,
    Thang,
    DoanhThuThang,
    LAG(DoanhThuThang) OVER (ORDER BY Nam, Thang) AS DoanhThuThangTruoc,
    DoanhThuThang
        - LAG(DoanhThuThang) OVER (ORDER BY Nam, Thang) AS ChenhLech,
    CASE
        WHEN LAG(DoanhThuThang) OVER (ORDER BY Nam, Thang) IS NULL THEN NULL
        WHEN LAG(DoanhThuThang) OVER (ORDER BY Nam, Thang) = 0 THEN NULL
        ELSE ROUND(
            (DoanhThuThang - LAG(DoanhThuThang) OVER (ORDER BY Nam, Thang))
            * 100.0
            / LAG(DoanhThuThang) OVER (ORDER BY Nam, Thang),
        2)
    END AS TyLeTangTruong_Pct
FROM DoanhThuThang
ORDER BY Nam, Thang;


-- QUERY 6: TỶ LỆ ĐƠN HÀNG THEO TRẠNG THÁI TỪNG THÁNG (PIVOT)
SELECT
    Nam,
    Thang,
    ISNULL([đã giao], 0) AS DonDaGiao,
    ISNULL([đang xử lý], 0) AS DonDangXuLy,
    ISNULL([đã hủy], 0) AS DonDaHuy
FROM (
    SELECT
        t.Nam,
        t.Thang,
        s.TrangThai,
        f.DonHangID
    FROM FACT_DON_HANG f
    JOIN DIM_THOI_GIAN t ON f.TimeKey = t.TimeKey
    JOIN DIM_STATUS_ORDER s ON f.StatusKey = s.StatusKey
) AS Src
PIVOT (
    COUNT(DonHangID)
    FOR TrangThai IN ([đã giao], [đang xử lý], [đã hủy])
) AS PivotTable
ORDER BY Nam, Thang;


-- QUERY 7: PHÂN KHÚC KHÁCH HÀNG VIP (NTILE - TOP 20%)
WITH DoanhThuKhach AS (
    SELECT
        kh.KhachHangID,
        kh.HoTen,
        kh.Email,
        kh.SoDienThoai,
        COUNT(DISTINCT f.DonHangID) AS SoDonHang,
        SUM(f.SoLuong) AS TongSanPhamMua,
        SUM(f.DoanhThu) AS TongChiTieu
    FROM FACT_DON_HANG f
    JOIN DIM_KHACH_HANG kh ON f.KhachHangKey = kh.KhachHangKey
    JOIN DIM_STATUS_ORDER s ON f.StatusKey = s.StatusKey
    WHERE s.TrangThai = N'đã giao'
    GROUP BY
        kh.KhachHangKey, kh.KhachHangID,
        kh.HoTen, kh.Email, kh.SoDienThoai
),
PhanKhuc AS (
    SELECT *,
        NTILE(5) OVER (ORDER BY TongChiTieu DESC) AS NhomChiTieu
        -- Nhóm 1 = top 20% chi tiêu cao nhất (VIP)
        -- Nhóm 5 = 20% chi tiêu thấp nhất
    FROM DoanhThuKhach
)
SELECT
    KhachHangID,
    HoTen,
    Email,
    SoDienThoai,
    SoDonHang,
    TongSanPhamMua,
    TongChiTieu,
    NhomChiTieu,
    CASE NhomChiTieu
        WHEN 1 THEN N'VIP - Platinum'
        WHEN 2 THEN N'VIP - Gold'
        WHEN 3 THEN N'Thông thường'
        WHEN 4 THEN N'Tiềm năng thấp'
        WHEN 5 THEN N'Không hoạt động'
    END AS PhanKhucKhachHang
FROM PhanKhuc
ORDER BY TongChiTieu DESC;