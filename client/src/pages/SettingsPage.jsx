import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import { UserPlus, Shield, User as UserIcon, Edit3, Trash2, Key, X, Check, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';
import UserAvatar, { AVATAR_PRESETS } from '../components/common/UserAvatar';

const SettingsPage = () => {
  const { user: currentUser, updateCurrentUser } = useAuth();
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null if creating

  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('NORMAL');
  const [avatar, setAvatar] = useState('avatar-1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setRole('NORMAL');
    setAvatar('avatar-1');
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setPassword(''); // leave blank unless updating
    setConfirmPassword('');
    setShowPassword(false);
    setRole(user.role);
    setAvatar(user.avatar || 'avatar-1');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingUser) {
        // Update user
        const payload = { fullName, role, avatar };
        if (password.trim() !== '') {
          if (password.length < 6) {
            toast.error('Password must be at least 6 characters long!');
            setSaving(false);
            return;
          }
          if (password !== confirmPassword) {
            toast.error('New password and confirmation do not match!');
            setSaving(false);
            return;
          }
          payload.password = password.trim();
        }
        const res = await axios.put(`/api/users/${editingUser._id}`, payload);
        
        // If logged-in user edited themselves, immediately update current user state
        if (currentUser && editingUser._id === currentUser._id && updateCurrentUser) {
          updateCurrentUser({
            fullName,
            role,
            avatar
          });
        }

        toast.success(
          password.trim() !== ''
            ? `User "${editingUser.username}" profile, avatar, and password updated successfully!`
            : `User "${editingUser.username}" updated successfully!`
        );
      } else {
        // Create user
        if (!username.trim() || !fullName.trim() || !password.trim()) {
          toast.error('Please fill in all required fields!');
          setSaving(false);
          return;
        }
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long!');
          setSaving(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error('Password and confirmation do not match!');
          setSaving(false);
          return;
        }
        await axios.post('/api/users', { 
          username: username.trim(), 
          fullName: fullName.trim(), 
          password: password.trim(), 
          role,
          avatar 
        });
        toast.success(`User "${username}" created successfully!`);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser._id) {
      toast.error('You cannot delete your own account!');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${user.username}" (${user.fullName})?`,
      confirmText: 'Delete User',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await axios.delete(`/api/users/${user._id}`);
        toast.success(`User "${user.username}" deleted successfully`);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  return (
    <DashboardLayout title="System Settings & User Management">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>User Management Settings</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage user accounts, customize avatar styles, assign roles, and update passwords.
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn-primary">
          <UserPlus size={16} /> Create New User
        </button>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Full Name</th>
              <th>System Role</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading users...</td>
              </tr>
            ) : users.length > 0 ? (
              users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserAvatar avatarId={u.avatar || 'avatar-1'} name={u.fullName || u.username} size={30} />
                        <div>
                          <span>{u.username}</span>
                          {isSelf && (
                            <span style={{ 
                              marginLeft: '6px', 
                              fontSize: '11px', 
                              background: 'rgba(244, 122, 32, 0.15)', 
                              color: 'var(--palette-orange)', 
                              padding: '2px 6px', 
                              borderRadius: '4px' 
                            }}>
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{u.fullName}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-paid' : 'badge-pending'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                          title="Edit User, Avatar, or Password"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="btn-danger"
                          style={{ padding: '6px 10px', fontSize: '13px', opacity: isSelf ? 0.4 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot delete yourself' : 'Delete User'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-card-custom" style={{ maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3 className="modal-title-custom">
                {editingUser ? <Edit3 size={18} color="var(--palette-orange)" /> : <UserPlus size={18} color="var(--palette-orange)" />}
                {editingUser ? `Edit User: ${editingUser.username}` : 'Create New User Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Avatar Selector */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ margin: 0 }}>User Avatar Theme</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    padding: '10px',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    marginTop: '6px'
                  }}>
                    {AVATAR_PRESETS.map((p) => {
                      const isSelected = avatar === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAvatar(p.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 4px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--palette-orange)' : '2px solid transparent',
                            backgroundColor: isSelected ? 'rgba(244, 122, 32, 0.1)' : 'transparent',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.12s ease'
                          }}
                          title={p.name}
                        >
                          <UserAvatar avatarId={p.id} name={fullName || username || 'JN'} size={32} showRing={isSelected} />
                          <span style={{
                            fontSize: '10.5px',
                            color: isSelected ? 'var(--palette-orange)' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 700 : 500,
                            textAlign: 'center',
                            width: '100%'
                          }}>
                            {p.name}
                          </span>
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--palette-orange)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Check size={9} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={Boolean(editingUser)}
                    required
                    placeholder="e.g. jhon"
                    style={editingUser ? { backgroundColor: 'var(--bg-main)', cursor: 'not-allowed', opacity: 0.8 } : {}}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Jhon Doe"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>User Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="filter-select"
                    style={{ width: '100%' }}
                  >
                    <option value="NORMAL">NORMAL (Regular Access)</option>
                    <option value="ADMIN">ADMIN (Full Access + User Settings)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ margin: 0 }}>{editingUser ? 'New Password (optional)' : 'Password *'}</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter at least 6 characters'}
                    autoComplete="new-password"
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                    {editingUser
                      ? 'Leave blank to keep existing password. To change, enter at least 6 characters.'
                      : 'Must be at least 6 characters long.'}
                  </small>
                </div>

                {(Boolean(password) || !editingUser) && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Confirm {editingUser ? 'New ' : ''}Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={Boolean(password) || !editingUser}
                      placeholder="Re-enter password to confirm"
                      autoComplete="new-password"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <small style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> Passwords do not match
                      </small>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <small style={{ color: '#22c55e', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> Passwords match
                      </small>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer-custom">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SettingsPage;
