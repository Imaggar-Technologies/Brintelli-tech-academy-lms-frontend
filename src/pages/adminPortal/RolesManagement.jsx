import { useState, useEffect } from 'react';
import { UserCog, Plus, Edit, Trash2, Shield, Users, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const RolesManagement = () => {
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Admin', description: 'Full system access', permissions: ['all'] },
    { id: 'tutor', name: 'Tutor', description: 'Teaching and content management', permissions: ['sessions:read', 'sessions:create', 'sessions:update'] },
    { id: 'student', name: 'Student', description: 'Learner access', permissions: ['sessions:read'] },
    { id: 'sales_agent', name: 'Sales Agent', description: 'Sales operations', permissions: ['sales:read', 'sales:create'] },
    { id: 'lsm', name: 'LSM', description: 'Learning Success Manager', permissions: ['lsm:read', 'lsm:update'] },
    { id: 'program-manager', name: 'Program Manager', description: 'Program management', permissions: ['programs:read', 'programs:update'] },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

  const handleCreateRole = () => {
    if (!formData.name) {
      toast.error('Role name is required');
      return;
    }
    const newRole = {
      id: formData.name.toLowerCase().replace(/\s+/g, '_'),
      ...formData,
    };
    setRoles([...roles, newRole]);
    toast.success('Role created successfully');
    setShowCreateModal(false);
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
      toast.success('Role deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description="Manage user roles and their descriptions"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map(role => (
          <div key={role.id} className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{role.name}</h3>
                  <p className="text-xs text-textMuted">{role.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedRole(role)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-textMuted mb-4">{role.description}</p>
            <div className="flex items-center gap-2 text-xs text-textMuted">
              <Shield className="h-3 w-3" />
              <span>{role.permissions?.length || 0} permissions</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', description: '', permissions: [] });
        }}
        title="Create New Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Content Manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Describe the role's purpose..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesManagement;

