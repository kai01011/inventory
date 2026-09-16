import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2, Edit3, UserCheck, UserX, Shield } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import { useState, useMemo } from 'react';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useToast } from '@/components/ui/toast';

export default function Users({ users, roles }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleOpenDialog = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRoleId('');
    setFormErrors({});
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRoleId('');
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const payload = {
      name: name,
      email: email,
      password: password,
      role_id: roleId,
    };

    if (editingUser) {
      router.put(`/users/${editingUser.id}`, payload, {
        onSuccess: () => {
          setIsSubmitting(false);
          handleCloseDialog();
          toast.success('User updated successfully!');
        },
        onError: (errors) => {
          setIsSubmitting(false);
          setFormErrors(errors);
          toast.error('Failed to update user.');
        }
      });
    } else {
      router.post('/users', payload, {
        onSuccess: () => {
          setIsSubmitting(false);
          handleCloseDialog();
          toast.success('User created successfully!');
        },
        onError: (errors) => {
          setIsSubmitting(false);
          setFormErrors(errors);
          toast.error('Failed to create user.');
        }
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRoleId(user.role_id.toString());
    setFormErrors({});
    setOpen(true);
  };

  const handleDelete = (id, userName) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete User',
      message: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      onConfirm: () => {
        router.delete(`/users/${id}`, {
          onSuccess: () => {
            toast.success('User deleted successfully!');
          },
          onError: () => {
            toast.error('Failed to delete user.');
          }
        });
      },
    });
  };

  const handleToggleStatus = (user) => {
    setConfirmModal({
      isOpen: true,
      type: user.is_active ? 'warning' : 'success',
      title: user.is_active ? 'Deactivate User' : 'Activate User',
      message: user.is_active 
        ? `Are you sure you want to deactivate "${user.name}"? They will not be able to login.`
        : `Are you sure you want to activate "${user.name}"? They will be able to login again.`,
      onConfirm: () => {
        router.post(`/users/${user.id}/toggle-status`, {}, {
          onSuccess: () => {
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully!`);
          },
          onError: () => {
            toast.error('Failed to update user status.');
          }
        });
      },
    });
  };

  const getRoleBadgeColor = (roleName) => {
    switch(roleName?.toLowerCase()) {
      case 'admin':
        return 'bg-gray-100 text-gray-700';
      case 'manager':
        return 'bg-gray-100 text-gray-700';
      case 'staff':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getRoleIcon = (roleName) => {
    if (roleName?.toLowerCase() === 'admin') {
      return <Shield size={14} className="inline mr-1" />;
    }
    return null;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role?.role_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchTerm]);

  return (
    <AuthenticatedLayout>
      <Head title="Users" />
      
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-4 mb-6">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Search users…"
              width="w-80"
              size="md"
            />
            <button onClick={handleOpenDialog} className="gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center whitespace-nowrap sm:ml-auto">
              <Plus size={18} />
              Add User
            </button>
            {open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseDialog();
              }}>
                <div className="bg-white rounded-lg shadow-lg max-w-[460px] px-6 py-6 w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">{editingUser ? 'Edit User' : 'Add User'}</h2>
                    <button
                      onClick={handleCloseDialog}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Close dialog"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Enter name"
                      autoComplete="off"
                    />
                    {formErrors.name && <p className="text-red-600 text-xs mt-1.5">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Enter email"
                      autoComplete="off"
                    />
                    {formErrors.email && <p className="text-red-600 text-xs mt-1.5">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Password {editingUser && '(leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                      autoComplete="new-password"
                    />
                    {formErrors.password && <p className="text-red-600 text-xs mt-1.5">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Role
                    </label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                    {formErrors.role_id && <p className="text-red-600 text-xs mt-1.5">{formErrors.role_id}</p>}
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseDialog}
                      className="px-4 h-10 border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 h-10 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {isSubmitting ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            )}
          </div>

          {/* Search */}

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[120px]">Name</th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[140px]">Email</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Role</th>
                  <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Status</th>
                  <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[130px]">Created At</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-sm text-gray-600 truncate" title={user.email}>{user.email}</td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role?.role_name)}`}>
                          {getRoleIcon(user.role?.role_name)}
                          {user.role?.role_name || 'N/A'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-4 py-3 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{formatDateOnly(user.created_at)}</span>
                          <span className="text-xs text-gray-500">{formatTimeOnly(user.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            title="Edit user"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
                            aria-label="Edit user"
                          >
                            <Edit3 size={16} />
                          </button>
                          {user.is_active ? (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              title="Deactivate user"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors duration-200"
                              aria-label="Deactivate user"
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              title="Activate user"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200"
                              aria-label="Activate user"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            title="Delete user"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                            aria-label="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 sm:px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </AuthenticatedLayout>
  );
}
