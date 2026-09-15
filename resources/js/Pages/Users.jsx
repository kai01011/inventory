import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit3, UserCheck, UserX, Shield } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import { useState, useMemo } from 'react';
import { formatDateTimeSingleLine } from '@/utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useToast } from '@/components/ui/toast';

export default function Users({ users, roles }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    role_id: '',
  });

  const deleteForm = useForm({});

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      put(`/users/${editingUser.id}`, {
        onSuccess: () => {
          reset();
          setOpen(false);
          setEditingUser(null);
          toast.success('User updated successfully!');
        },
        onError: () => {
          toast.error('Failed to update user.');
        }
      });
    } else {
      post('/users', {
        onSuccess: () => {
          reset();
          setOpen(false);
          toast.success('User created successfully!');
        },
        onError: () => {
          toast.error('Failed to create user.');
        }
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setData({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id.toString(),
    });
    setOpen(true);
  };

  const handleDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete User',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteForm.delete(`/users/${id}`, {
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

  const getRoleBadgeColor = (roleName) => {
    switch(roleName?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'manager':
        return 'bg-blue-100 text-blue-700';
      case 'staff':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (roleName) => {
    if (roleName?.toLowerCase() === 'admin') {
      return <Shield size={14} className="inline mr-1" />;
    }
    return null;
  };

  // Memoize filtered users to avoid recalculating on every render
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
          <div className="flex items-center justify-between mb-6">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-red-600 hover:bg-red-700">
                  <Plus size={18} />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Update user information' : 'Add a new user to the system'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter name"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter email"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Password {editingUser && '(leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Role
                    </label>
                    <select
                      value={data.role_id}
                      onChange={(e) => setData('role_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                    {errors.role_id && <p className="text-red-600 text-sm mt-1">{errors.role_id}</p>}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setEditingUser(null);
                        reset();
                      }}
                      variant="outline"
                      className="border border-gray-300 text-gray-900 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={processing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {processing ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="mb-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email, or role..."
            />
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[120px]">Name</th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[140px]">Email</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Role</th>
                  <th className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[120px]">Created</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[100px]">Actions</th>
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
                      <td className="hidden md:table-cell px-3 sm:px-4 py-3 text-sm text-gray-600">
                        {formatDateTimeSingleLine(user.created_at)}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            title="Edit user"
                            className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-200"
                          >
                            <Edit3 size={16} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            title="Delete user"
                            className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white shadow-sm hover:shadow-red-200 hover:shadow-md transition-all duration-200"
                          >
                            <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-200" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 sm:px-4 py-8 text-center text-gray-500">
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
