const { sql, poolPromise } = require('../../config/db');

exports.getBrands = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;
  const { search } = req.query;

  try {
    const pool = await poolPromise;
    if (!pool) {
      let mockBrands = [
        { hang_id: 1, ten: 'Apple', mo_ta: 'Apple Inc.' },
        { hang_id: 2, ten: 'Samsung', mo_ta: 'Samsung Electronics' },
        { hang_id: 3, ten: 'Sony', mo_ta: 'Sony Corporation' },
        { hang_id: 4, ten: 'Asus', mo_ta: 'Asus Computer' },
        { hang_id: 5, ten: 'Xiaomi', mo_ta: 'Xiaomi Global' }
      ];
      if (search) {
        const query = search.toLowerCase();
        mockBrands = mockBrands.filter(b => b.ten.toLowerCase().includes(query) || (b.mo_ta && b.mo_ta.toLowerCase().includes(query)));
      }
      const totalItems = mockBrands.length;
      const totalPages = Math.ceil(totalItems / limit);
      const paginatedBrands = mockBrands.slice(offset, offset + limit);
      return res.json({
        brands: paginatedBrands,
        totalItems,
        totalPages,
        currentPage: page,
        limit
      });
    }

    const countRequest = pool.request();
    let countQuery = 'SELECT COUNT(*) AS total FROM HANG WITH (NOLOCK) WHERE 1=1';
    const dataRequest = pool.request();
    let dataQuery = 'SELECT * FROM HANG WITH (NOLOCK) WHERE 1=1';

    if (search) {
      countQuery += ' AND (ten LIKE @search OR mo_ta LIKE @search)';
      dataQuery += ' AND (ten LIKE @search OR mo_ta LIKE @search)';
      countRequest.input('search', sql.NVarChar, `%${search}%`);
      dataRequest.input('search', sql.NVarChar, `%${search}%`);
    }

    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    dataQuery += ' ORDER BY hang_id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('limit', sql.Int, limit);

    const dataResult = await dataRequest.query(dataQuery);

    res.json({
      brands: dataResult.recordset,
      totalItems,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách hãng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách hãng' });
  }
};

exports.createBrand = async (req, res) => {
  const { ten, mo_ta } = req.body;
  if (!ten) return res.status(400).json({ message: 'Tên hãng không được để trống' });

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Thêm hãng thành công (Mock Mode)' });

    await pool.request()
      .input('ten', sql.NVarChar, ten)
      .input('mo_ta', sql.NVarChar, mo_ta || null)
      .query('INSERT INTO HANG (ten, mo_ta) VALUES (@ten, @mo_ta)');

    res.status(201).json({ message: 'Đã thêm hãng sản xuất mới thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm hãng' });
  }
};

exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  const { ten, mo_ta } = req.body;
  if (!ten) return res.status(400).json({ message: 'Tên hãng không được để trống' });

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Cập nhật hãng thành công (Mock Mode)' });

    await pool.request()
      .input('id', sql.Int, id)
      .input('ten', sql.NVarChar, ten)
      .input('mo_ta', sql.NVarChar, mo_ta || null)
      .query('UPDATE HANG SET ten = @ten, mo_ta = @mo_ta WHERE hang_id = @id');

    res.json({ message: 'Cập nhật hãng sản xuất thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật hãng' });
  }
};

exports.deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    if (!pool) return res.json({ message: 'Xóa hãng thành công (Mock Mode)' });

    // Referential integrity check
    const checkProducts = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) AS count FROM SAN_PHAM WITH (NOLOCK) WHERE hang_id = @id');

    if (checkProducts.recordset[0].count > 0) {
      return res.status(400).json({ message: 'Không thể xóa hãng này vì vẫn còn sản phẩm đang thuộc về hãng.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM HANG WHERE hang_id = @id');

    res.json({ message: 'Đã xóa hãng sản xuất thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa hãng' });
  }
};
