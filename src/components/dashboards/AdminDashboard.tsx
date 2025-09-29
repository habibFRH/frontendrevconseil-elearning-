import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { userManagementService, type AdminStats } from '../../services/adminService';
import type { User } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';
import UserEditDialog, { type UserUpdateData } from '../common/UserEditDialog';
import UserAddDialog, { type UserCreateData } from '../common/UserAddDialog';
import ToastContainer from '../common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { PencilSquareIcon, TrashIcon, PowerIcon } from "@heroicons/react/24/solid";


const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'toggleStatus' | null;
    user: User | null;
    userInput: string;
  }>({
    isOpen: false,
    type: null,
    user: null,
    userInput: ''
  });

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false
  });

  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        userManagementService.getAllUsers(),
        userManagementService.getStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    console.log('Opening toggle status dialog for user:', user);
    setConfirmDialog({
      isOpen: true,
      type: 'toggleStatus',
      user,
      userInput: ''
    });
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    console.log('Opening delete dialog for user:', user);
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      user,
      userInput: ''
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.user) return;

    try {
      if (confirmDialog.type === 'delete') {
        await userManagementService.deleteUser(confirmDialog.user.id);
        success(`User ${confirmDialog.user.firstName} ${confirmDialog.user.lastName} deleted successfully`);
      } else if (confirmDialog.type === 'toggleStatus') {
        await userManagementService.toggleUserStatus(confirmDialog.user.id);
        const action = confirmDialog.user.isActive ? 'deactivated' : 'activated';
        success(`User ${confirmDialog.user.firstName} ${confirmDialog.user.lastName} ${action} successfully`);
      }
      
      await fetchData();
    } catch (err) {
      console.error(`Error ${confirmDialog.type === 'delete' ? 'deleting' : 'updating'} user:`, err);
      showError(`Failed to ${confirmDialog.type === 'delete' ? 'delete' : 'update'} user`);
    } finally {
      setConfirmDialog({ isOpen: false, type: null, user: null, userInput: '' });
    }
  };

  const handleCancelAction = () => {
    setConfirmDialog({ isOpen: false, type: null, user: null, userInput: '' });
  };

  const handleEditUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    console.log('Opening edit dialog for user:', user);
    setEditDialog({
      isOpen: true,
      user
    });
  };

  const handleSaveUser = async (userId: number, userData: UserUpdateData) => {
    try {
      await userManagementService.updateUser(userId, userData);
      success(`User ${userData.firstName} ${userData.lastName} updated successfully`);
      await fetchData(); // Refresh the data
      setEditDialog({ isOpen: false, user: null });
    } catch (err) {
      console.error('Error updating user:', err);
      showError('Failed to update user information');
    }
  };

  const handleCancelEdit = () => {
    setEditDialog({ isOpen: false, user: null });
  };

  const handleAddUser = () => {
    console.log('Opening add user dialog');
    setAddDialog({ isOpen: true });
  };

  const handleCreateUser = async (userData: UserCreateData) => {
    try {
      await userManagementService.createUser(userData);
      success(`User ${userData.firstName} ${userData.lastName} created successfully`);
      await fetchData(); // Refresh the data
      setAddDialog({ isOpen: false });
    } catch (err) {
      console.error('Error creating user:', err);
      showError('Failed to create user');
    }
  };

  const handleCancelAdd = () => {
    setAddDialog({ isOpen: false });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && user.isActive) ||
                         (filterStatus === 'INACTIVE' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading user data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const getDialogProps = () => {
    console.log('getDialogProps called with:', { confirmDialog });
    
    if (!confirmDialog.user || !confirmDialog.type) {
      const props = {
        title: '',
        message: ''
      };
      console.log('Returning empty props:', props);
      return props;
    }

    if (confirmDialog.type === 'delete') {
      const props = {
        title: 'Delete User',
        message: `Are you sure you want to permanently delete ${confirmDialog.user.firstName} ${confirmDialog.user.lastName} (${confirmDialog.user.email})?\n\nThis action cannot be undone and will:\n• Remove all user data\n• Delete their course enrollments\n• Remove their account permanently`,
        confirmText: 'Delete User',
        type: 'danger' as const,
        requireTextConfirmation: true,
        confirmationText: 'DELETE'
      };
      console.log('Returning delete props:', props);
      return props;
    } else {
      const action = confirmDialog.user.isActive ? 'deactivate' : 'activate';
      const props = {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message: confirmDialog.user.isActive 
          ? `Are you sure you want to deactivate ${confirmDialog.user.firstName} ${confirmDialog.user.lastName}?\n\nThey will lose access to the platform and won't be able to log in.`
          : `Are you sure you want to activate ${confirmDialog.user.firstName} ${confirmDialog.user.lastName}?\n\nThey will regain access to the platform.`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        type: confirmDialog.user.isActive ? 'warning' as const : 'info' as const
      };
      console.log('Returning toggle props:', props);
      return props;
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
                  {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Admin Control Panel</h1>
          <p className="text-red-100">Manage users, courses, and monitor platform activity from your central dashboard.</p>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.activeUsers || 0}</p>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.students || 0}</p>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.teachers || 0}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6">
  <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
    {/* Search Users */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
      <input
        type="text"
        placeholder="Search by name, email, or username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
      />
    </div>

    {/* Filter by Role */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
      >
        <option value="ALL">All Roles</option>
        <option value="STUDENT">Students</option>
        <option value="TEACHER">Teachers</option>
        <option value="ADMIN">Admins</option>
      </select>
    </div>

    {/* Filter by Status */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
      >
        <option value="ALL">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
    </div>

    {/* Add New User Button */}
    <div className="flex items-end">
      <button
        onClick={handleAddUser}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        title="Create a new user account"
      >
        Add New User
      </button>
    </div>
    </div>
  </div>
</div>


        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Users ({filteredUsers.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          onClick={() => handleEditUser(user.id)}
                          title="Edit user information"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className={`transition-colors ${
                            user.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          onClick={() => handleToggleUserStatus(user.id)}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          <PowerIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete user permanently"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        userInput={confirmDialog.userInput}
        onInputChange={(value) => setConfirmDialog(prev => ({ ...prev, userInput: value }))}
        {...getDialogProps()}
      />

      {/* User Edit Dialog */}
      <UserEditDialog
        isOpen={editDialog.isOpen}
        user={editDialog.user}
        onSave={handleSaveUser}
        onCancel={handleCancelEdit}
      />

      {/* User Add Dialog */}
      <UserAddDialog
        isOpen={addDialog.isOpen}
        onSave={handleCreateUser}
        onCancel={handleCancelAdd}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
    </>
  );
};

export default AdminDashboard;
