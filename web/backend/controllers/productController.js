const { sql, poolPromise } = require('../config/db');

exports.getBrands = async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock data fallback if database is not connected
      return res.json([
        { hang_id: 1, ten: 'Apple', mo_ta: 'Apple Inc.' },
        { hang_id: 2, ten: 'Samsung', mo_ta: 'Samsung Electronics' },
        { hang_id: 3, ten: 'Sony', mo_ta: 'Sony Corporation' },
        { hang_id: 4, ten: 'Asus', mo_ta: 'Asus Computer' }
      ]);
    }
    const result = await pool.request().query('SELECT * FROM HANG WITH (NOLOCK) ORDER BY ten');
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách hãng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách hãng sản xuất' });
  }
};

exports.getProducts = async (req, res) => {
  const { brandId, search, minPrice, maxPrice, sort } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock data fallback if database is not connected
      let mockProducts = [
        { san_pham_id: 1, hang_id: 1, ten: 'iPhone 15 Pro Max', mo_ta: 'Điện thoại thông minh cao cấp nhất của Apple với khung Titan siêu bền và camera zoom 5x.', gia: 29990000, con_hang: true, anh_url: null, ten_hang: 'Apple' },
        { san_pham_id: 2, hang_id: 2, ten: 'Samsung Galaxy S24 Ultra', mo_ta: 'Flagship đỉnh cao từ Samsung tích hợp bút S-Pen và tính năng AI thông minh vượt trội.', gia: 28990000, con_hang: true, anh_url: null, ten_hang: 'Samsung' },
        { san_pham_id: 3, hang_id: 1, ten: 'MacBook Pro M3', mo_ta: 'Laptop làm việc chuyên nghiệp, chip Apple M3 hiệu năng mạnh mẽ, thời lượng pin 22 tiếng.', gia: 39990000, con_hang: true, anh_url: null, ten_hang: 'Apple' },
        { san_pham_id: 4, hang_id: 3, ten: 'Sony WH-1000XM5', mo_ta: 'Tai nghe chụp tai chống ồn hàng đầu thế giới với âm thanh chất lượng cao Hi-Res audio.', gia: 6490000, con_hang: true, anh_url: null, ten_hang: 'Sony' },
        { san_pham_id: 5, hang_id: 4, ten: 'Asus ROG Ally', mo_ta: 'Máy chơi game cầm tay chạy Windows 11 mạnh mẽ, màn hình 120Hz mượt mà ấn tượng.', gia: 17990000, con_hang: true, anh_url: null, ten_hang: 'Asus' }
      ];
      
      let filtered = mockProducts;
      if (brandId) {
        filtered = filtered.filter(p => p.hang_id === parseInt(brandId));
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(p => p.ten.toLowerCase().includes(query) || p.mo_ta.toLowerCase().includes(query));
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.gia >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.gia <= parseFloat(maxPrice));
      }
      
      // Sort logic
      if (sort === 'asc') {
        filtered.sort((a, b) => a.gia - b.gia);
      } else if (sort === 'desc') {
        filtered.sort((a, b) => b.gia - a.gia);
      } else {
        filtered.sort((a, b) => b.san_pham_id - a.san_pham_id);
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / limit);
      const paginatedProducts = filtered.slice(offset, offset + limit);

      return res.json({
        products: paginatedProducts,
        totalItems,
        totalPages,
        currentPage: page,
        limit
      });
    }

    // 1. Fetch total matching records for page computation
    const countRequest = pool.request();
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM SAN_PHAM sp WITH (NOLOCK)
      LEFT JOIN HANG h WITH (NOLOCK) ON sp.hang_id = h.hang_id
      WHERE 1=1
    `;

    // 2. Fetch paginated records using OFFSET and FETCH NEXT
    const dataRequest = pool.request();
    let dataQuery = `
      SELECT sp.*, h.ten AS ten_hang
      FROM SAN_PHAM sp WITH (NOLOCK)
      LEFT JOIN HANG h WITH (NOLOCK) ON sp.hang_id = h.hang_id
      WHERE 1=1
    `;

    if (brandId) {
      countQuery += ` AND sp.hang_id = @brandId`;
      dataQuery += ` AND sp.hang_id = @brandId`;
      countRequest.input('brandId', sql.Int, parseInt(brandId));
      dataRequest.input('brandId', sql.Int, parseInt(brandId));
    }

    if (search) {
      countQuery += ` AND (sp.ten LIKE @search OR sp.mo_ta LIKE @search)`;
      dataQuery += ` AND (sp.ten LIKE @search OR sp.mo_ta LIKE @search)`;
      countRequest.input('search', sql.NVarChar, `%${search}%`);
      dataRequest.input('search', sql.NVarChar, `%${search}%`);
    }

    if (minPrice) {
      countQuery += ` AND sp.gia >= @minPrice`;
      dataQuery += ` AND sp.gia >= @minPrice`;
      countRequest.input('minPrice', sql.Decimal(18, 2), parseFloat(minPrice));
      dataRequest.input('minPrice', sql.Decimal(18, 2), parseFloat(minPrice));
    }

    if (maxPrice) {
      countQuery += ` AND sp.gia <= @maxPrice`;
      dataQuery += ` AND sp.gia <= @maxPrice`;
      countRequest.input('maxPrice', sql.Decimal(18, 2), parseFloat(maxPrice));
      dataRequest.input('maxPrice', sql.Decimal(18, 2), parseFloat(maxPrice));
    }

    // Execute count query
    const countResult = await countRequest.query(countQuery);
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Apply sorting configuration
    let orderBy = 'ORDER BY sp.san_pham_id DESC';
    if (sort === 'asc') {
      orderBy = 'ORDER BY sp.gia ASC';
    } else if (sort === 'desc') {
      orderBy = 'ORDER BY sp.gia DESC';
    }

    dataQuery += ` ${orderBy} OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('limit', sql.Int, limit);

    // Execute data query
    const dataResult = await dataRequest.query(dataQuery);

    res.json({
      products: dataResult.recordset,
      totalItems,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách sản phẩm' });
  }
};

exports.getProductDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    if (!pool) {
      // Mock data fallback if database is not connected
      const mockProducts = [
        { san_pham_id: 1, hang_id: 1, ten: 'iPhone 15 Pro Max', mo_ta: 'Điện thoại thông minh cao cấp nhất của Apple với khung Titan siêu bền và camera zoom 5x.', gia: 29990000, con_hang: true, anh_url: '/images/iphone15.png', ten_hang: 'Apple', mo_ta_hang: 'Apple Inc.' },
        { san_pham_id: 2, hang_id: 2, ten: 'Samsung Galaxy S24 Ultra', mo_ta: 'Flagship đỉnh cao từ Samsung tích hợp bút S-Pen và tính năng AI thông minh vượt trội.', gia: 28990000, con_hang: true, anh_url: '/images/s24ultra.png', ten_hang: 'Samsung', mo_ta_hang: 'Samsung Electronics' },
        { san_pham_id: 3, hang_id: 1, ten: 'MacBook Pro M3', mo_ta: 'Laptop làm việc chuyên nghiệp, chip Apple M3 hiệu năng mạnh mẽ, thời lượng pin 22 tiếng.', gia: 39990000, con_hang: true, anh_url: '/images/macbookm3.png', ten_hang: 'Apple', mo_ta_hang: 'Apple Inc.' },
        { san_pham_id: 4, hang_id: 3, ten: 'Sony WH-1000XM5', mo_ta: 'Tai nghe chụp tai chống ồn hàng đầu thế giới với âm thanh chất lượng cao Hi-Res audio.', gia: 6490000, con_hang: true, anh_url: '/images/sonyheadphones.png', ten_hang: 'Sony', mo_ta_hang: 'Sony Corporation' },
        { san_pham_id: 5, hang_id: 4, ten: 'Asus ROG Ally', mo_ta: 'Máy chơi game cầm tay chạy Windows 11 mạnh mẽ, màn hình 120Hz mượt mà ấn tượng.', gia: 17990000, con_hang: true, anh_url: '/images/rogally.png', ten_hang: 'Asus', mo_ta_hang: 'Asus Computer' }
      ];
      const prod = mockProducts.find(p => p.san_pham_id === parseInt(id));
      if (!prod) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return res.json(prod);
    }

    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT sp.*, h.ten AS ten_hang, h.mo_ta AS mo_ta_hang
        FROM SAN_PHAM sp WITH (NOLOCK)
        LEFT JOIN HANG h WITH (NOLOCK) ON sp.hang_id = h.hang_id
        WHERE sp.san_pham_id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết sản phẩm' });
  }
};
