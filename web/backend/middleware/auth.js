module.exports = function(req, res, next) {
  // Read customer ID from custom HTTP header
  const khachHangId = req.header('x-customer-id');
  
  if (!khachHangId) {
    return res.status(401).json({ message: 'Quyền truy cập bị từ chối. Vui lòng đăng nhập.' });
  }

  // Parse ID to integer
  const parsedId = parseInt(khachHangId);
  if (isNaN(parsedId)) {
    return res.status(401).json({ message: 'Mã khách hàng không hợp lệ' });
  }

  req.user = { khach_hang_id: parsedId };
  next();
};
