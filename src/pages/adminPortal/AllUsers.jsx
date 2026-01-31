import { useState, useEffect } from 'react';
import { Users, Search, Filter, UserPlus, Edit, Trash2, MoreVertical, Mail, Phone, Building2, Shield, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { userAPI } from '../../api/user';
import toast from 'react-hot-toast';
import { useDataFetch } from '../../hooks/useDataFetch';

const AllUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch all users with retry logic
  const fetchAllUsers = async () => {
    try {
      // Fetch users by different roles and combine
      const roles = ['student', 'tutor', 'lsm', 'sales_agent', 'sales_lead', 'sales_admin', 'admin', 'mentor', 'program-manager'];
      const allUsersPromises = roles.map(role => 
        userAPI.getUsersByRole(role).catch(() => ({ success: false, data: { users: [] } }))
      );
      
      const results = await Promise.all(allUsersPromises);
      const combinedUsers = results
        .filter(r => r.success && r.data?.users)
        .flatMap(r => r.data.users)
        .map(user => ({
          ...user,
          id: user._id || user.id,
          name: user.fullName || user.name || user.email,
          email: user.email,
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
        }));

      return combinedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  const { data: users = [], loading, error, refetch } = useDataFetch(fetchAllUsers, {
    errorMessage: 'Failed to load users',
    maxRetries: 3,
    cacheTime: 30000,
  });

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!user.name?.toLowerCase().includes(query) &&
          !user.email?.toLowerCase().includes(query) &&
          !user.phone?.includes(query)) {
        return false;
      }
    }
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    return true;
  });

  const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))];

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-brand-600 font-semibold">
              {value?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium text-text">{value || 'N/A'}</p>
            <p className="text-xs text-textMuted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value || 'active'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(row);
              setShowUserModal(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Users"
        description="Manage all users across the platform"
        actions={
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-textMuted">Loading users...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 mb-4">Failed to load users</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <Table data={filteredUsers} columns={columns} />
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <p className="text-text">{selectedUser.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <p className="text-text">{selectedUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <p className="text-text">{selectedUser.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <p className="text-text">{selectedUser.status || 'active'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;

