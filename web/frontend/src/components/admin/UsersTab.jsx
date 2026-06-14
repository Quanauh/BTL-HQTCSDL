import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function UsersTab({
  users,
  userSearchInput,
  setUserSearchInput,
  userPage,
  setUserPage,
  userTotalPages,
  setUserSearch,
  handleOpenUserModal,
  handleDeleteUser,
  currentUser
}) {
  const triggerSearch = () => {
    setUserPage(1);
    setUserSearch(userSearchInput);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Quản lý Người dùng</h2>
        <div className="admin-search-wrapper">
          <input 
            type="text" 
            placeholder="Tìm email hoặc tên..." 
            value={userSearchInput}
            onChange={(e) => setUserSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') triggerSearch(); }}
            className="admin-search-input"
          />
          <button onClick={triggerSearch} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>Tìm</button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã TK</th>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Vai trò</th>
              <th style={{ width: '120px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(usr => (
              <tr key={usr.tai_khoan_id}>
                <td style={{ fontWeight: 700 }}>#{usr.tai_khoan_id}</td>
                <td>{usr.email}</td>
                <td style={{ fontWeight: 600 }}>{usr.ho_ten || '(Chưa tạo profile)'}</td>
                <td>{usr.so_dien_thoai || '-'}</td>
                <td style={{ maxWidth: '200px', fontSize: '13px' }}>{usr.dia_chi || '-'}</td>
                <td>
                  <span className={`role-badge ${usr.vai_tro}`}>
                    {usr.vai_tro === 'admin' ? 'Admin' : 'Khách hàng'}
                  </span>
                </td>
                <td>
                  <div className="admin-action-btn-group">
                    <button onClick={() => handleOpenUserModal(usr)} className="admin-action-btn edit" title="Sửa">
                      <Edit size={14} />
                    </button>
                    <button 
                      disabled={currentUser?.tai_khoan_id === usr.tai_khoan_id}
                      onClick={() => handleDeleteUser(usr.tai_khoan_id)} 
                      className="admin-action-btn delete" 
                      title="Xóa"
                      style={{ opacity: currentUser?.tai_khoan_id === usr.tai_khoan_id ? 0.4 : 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button 
          disabled={userPage <= 1} 
          onClick={() => setUserPage(prev => prev - 1)}
          className="btn btn-secondary btn-sm"
        >
          Trước
        </button>
        <span className="pagination-info">Trang {userPage} / {userTotalPages}</span>
        <button 
          disabled={userPage >= userTotalPages} 
          onClick={() => setUserPage(prev => prev + 1)}
          className="btn btn-secondary btn-sm"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
