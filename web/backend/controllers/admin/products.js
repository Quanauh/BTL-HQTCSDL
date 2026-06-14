const { sql, poolPromise } = require('../../config/db');

exports.createProduct = async (req, res) => {
  const { hang_id, ten, mo_ta, gia, con_hang } = req.body;
  if (!hang_id || !ten || gia === undefined) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc (Hãng, Tên sản phẩm, Giá)' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Thêm sản phẩm thành công (Mock Mode)' });

    await pool.request()
      .input('hang_id', sql.Int, hang_id)
      .input('ten', sql.NVarChar, ten)
      .input('mo_ta', sql.NVarChar, mo_ta || null)
      .input('gia', sql.Decimal(18, 2), gia)
      .input('con_hang', sql.Bit, con_hang !== undefined ? con_hang : 1)
      .query('INSERT INTO SAN_PHAM (hang_id, ten, mo_ta, gia, con_hang, anh_url) VALUES (@hang_id, @ten, @mo_ta, @gia, @con_hang, NULL)');

    res.status(201).json({ message: 'Đã thêm sản phẩm mới thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm sản phẩm' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { hang_id, ten, mo_ta, gia, con_hang } = req.body;
  
  if (!hang_id || !ten || gia === undefined) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Cập nhật sản phẩm thành công (Mock Mode)' });

    await pool.request()
      .input('id', sql.Int, id)
      .input('hang_id', sql.Int, hang_id)
      .input('ten', sql.NVarChar, ten)
      .input('mo_ta', sql.NVarChar, mo_ta || null)
      .input('gia', sql.Decimal(18, 2), gia)
      .input('con_hang', sql.Bit, con_hang !== undefined ? con_hang : 1)
      .query('UPDATE SAN_PHAM SET hang_id = @hang_id, ten = @ten, mo_ta = @mo_ta, gia = @gia, con_hang = @con_hang WHERE san_pham_id = @id');

    res.json({ message: 'Cập nhật thông tin sản phẩm thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật sản phẩm' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Xóa sản phẩm thành công (Mock Mode)' });

    // Referential integrity check (Orders)
    const checkOrders = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) AS count FROM CHI_TIET_DON_HANG WHERE san_pham_id = @id');

    if (checkOrders.recordset[0].count > 0) {
      // Instead of throwing error, we soft-disable the product (out of stock)
      await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE SAN_PHAM SET con_hang = 0 WHERE san_pham_id = @id');
      return res.status(200).json({ message: 'Sản phẩm đã có trong lịch sử mua hàng, hệ thống đã tự động ẩn sản phẩm thay vì xóa.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM SAN_PHAM WHERE san_pham_id = @id');

    res.json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa sản phẩm' });
  }
};
