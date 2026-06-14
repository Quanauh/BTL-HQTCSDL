module.exports = function(req, res, next) {
  const taiKhoanId = req.header('x-account-id');
  const vaiTro = req.header('x-role'); // 'Admin' or 'KhachHang'
  
  if (!taiKhoanId) {
    return res.status(401).json({ message: 'Quyền truy cập bị từ chối. Vui lòng đăng nhập tài khoản quản trị.' });
  }

  const parsedAccountId = parseInt(taiKhoanId);
  if (isNaN(parsedAccountId)) {
    return res.status(401).json({ message: 'Mã tài khoản quản trị không hợp lệ.' });
  }

  if (vaiTro !== 'admin') {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Khu vực dành riêng cho Quản trị viên.' });
  }

  req.user = {
    tai_khoan_id: parsedAccountId,
    vai_tro: vaiTro
  };
  
  next();
};
