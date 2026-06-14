const { sql, poolPromise } = require('../config/db');

exports.register = async (req, res) => {
  const { email, mat_khau, ho_ten, so_dien_thoai, dia_chi } = req.body;
  if (!email || !mat_khau || !ho_ten) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc (email, mật khẩu, họ tên)' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(500).json({ message: 'Lỗi kết nối cơ sở dữ liệu' });

    // Check if email already exists
    const checkEmail = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT tai_khoan_id FROM TAI_KHOAN WHERE email = @email');

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký sử dụng' });
    }

    // Initialize Transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Insert into TAI_KHOAN (Plain-text mat_khau as requested)
      const requestTaiKhoan = new sql.Request(transaction);
      const resTaiKhoan = await requestTaiKhoan
        .input('email', sql.NVarChar, email)
        .input('mat_khau', sql.NVarChar, mat_khau)
        .input('vai_tro', sql.NVarChar, 'customer')
        .query('INSERT INTO TAI_KHOAN (email, mat_khau, vai_tro) OUTPUT Inserted.tai_khoan_id VALUES (@email, @mat_khau, @vai_tro)');

      const tai_khoan_id = resTaiKhoan.recordset[0].tai_khoan_id;

      // 2. Insert into KHACH_HANG linked with the tai_khoan_id
      const requestKhachHang = new sql.Request(transaction);
      await requestKhachHang
        .input('tai_khoan_id', sql.Int, tai_khoan_id)
        .input('ho_ten', sql.NVarChar, ho_ten)
        .input('email', sql.NVarChar, email)
        .input('so_dien_thoai', sql.NVarChar, so_dien_thoai || null)
        .input('dia_chi', sql.NVarChar, dia_chi || null)
        .query('INSERT INTO KHACH_HANG (tai_khoan_id, ho_ten, email, so_dien_thoai, dia_chi) VALUES (@tai_khoan_id, @ho_ten, @email, @so_dien_thoai, @dia_chi)');

      await transaction.commit();
      res.status(201).json({ message: 'Đăng ký tài khoản thành công! Xin hãy đăng nhập.' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ khi đăng ký tài khoản' });
  }
};

exports.login = async (req, res) => {
  const { email, mat_khau } = req.body;
  if (!email || !mat_khau) {
    return res.status(400).json({ message: 'Vui lòng điền email và mật khẩu' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock login fallback if database is not connected
      return res.json({
        user: {
          tai_khoan_id: 999,
          khach_hang_id: 999,
          email: email,
          ho_ten: 'Khách hàng Demo',
          so_dien_thoai: '0987654321',
          dia_chi: '123 Đường Demo, Hà Nội',
          vai_tro: 'customer'
        }
      });
    }

    // Join account with customer information
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT tk.tai_khoan_id, tk.email, tk.mat_khau, tk.vai_tro, kh.khach_hang_id, kh.ho_ten, kh.so_dien_thoai, kh.dia_chi
        FROM TAI_KHOAN tk
        LEFT JOIN KHACH_HANG kh ON tk.tai_khoan_id = kh.tai_khoan_id
        WHERE tk.email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const user = result.recordset[0];

    // Verify Password (Plain-text matching)
    if (mat_khau !== user.mat_khau) {
      return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    res.json({
      user: {
        tai_khoan_id: user.tai_khoan_id,
        khach_hang_id: user.khach_hang_id,
        email: user.email,
        ho_ten: user.ho_ten,
        so_dien_thoai: user.so_dien_thoai,
        dia_chi: user.dia_chi,
        vai_tro: user.vai_tro
      }
    });
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ khi đăng nhập' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.json({
        khach_hang_id: req.user.khach_hang_id,
        ho_ten: 'Khách hàng Demo',
        email: 'demo@example.com',
        so_dien_thoai: '0987654321',
        dia_chi: '123 Đường Demo, Hà Nội'
      });
    }

    const result = await pool.request()
      .input('khach_hang_id', sql.Int, req.user.khach_hang_id)
      .query('SELECT khach_hang_id, ho_ten, email, so_dien_thoai, dia_chi FROM KHACH_HANG WHERE khach_hang_id = @khach_hang_id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cá nhân khách hàng' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi khi lấy thông tin cá nhân:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy profile' });
  }
};

exports.updateProfile = async (req, res) => {
  const { ho_ten, so_dien_thoai, dia_chi } = req.body;
  if (!ho_ten) {
    return res.status(400).json({ message: 'Họ và tên không được để trống' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Cập nhật thông tin thành công (Mock Mode)' });

    await pool.request()
      .input('khach_hang_id', sql.Int, req.user.khach_hang_id)
      .input('ho_ten', sql.NVarChar, ho_ten)
      .input('so_dien_thoai', sql.NVarChar, so_dien_thoai || null)
      .input('dia_chi', sql.NVarChar, dia_chi || null)
      .query(`
        UPDATE KHACH_HANG
        SET ho_ten = @ho_ten, so_dien_thoai = @so_dien_thoai, dia_chi = @dia_chi
        WHERE khach_hang_id = @khach_hang_id
      `);

    res.json({ message: 'Cập nhật thông tin tài khoản thành công!' });
  } catch (err) {
    console.error('Lỗi khi cập nhật thông tin cá nhân:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật profile' });
  }
};
