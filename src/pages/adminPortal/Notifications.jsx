import { useState } from 'react';
import { Bell, Plus, Send, Users, RefreshCw, Edit, Trash2, Radio } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import notificationApi from '../../api/notification';
import { useDataFetch } from '../../hooks/useDataFetch';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationType, setNotificationType] = useState('broadcast'); // broadcast, targeted
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    targetRoles: [],
    targetUsers: [],
  });

  const fetchNotifications = async () => {
    // This would fetch system notifications/broadcasts
    // For now, return mock data structure
    return [];
  };

  const { data: notifications = [], loading, refetch } = useDataFetch(fetchNotifications, {
    errorMessage: 'Failed to load notifications',
    maxRetries: 3,
  });

  const handleSendNotification = () => {
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }
    // TODO: Send notification via API
    toast.success('Notification sent successfully');
    setShowCreateModal(false);
    setFormData({ title: '', message: '', type: 'INFO', targetRoles: [], targetUsers: [] });
    refetch();
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Sent At',
      render: (value) => (
        <span className="text-sm text-textMuted">
          {value ? new Date(value).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Broadcasts"
        description="Send notifications and broadcasts to users"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        }
      />

      {/* Notification Type Tabs */}
      <div className="flex gap-2 border-b border-brintelli-border">
        <button
          onClick={() => setNotificationType('broadcast')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
            notificationType === 'broadcast'
              ? 'border-b-2 border-brand-500 text-brand-600'
              : 'text-textMuted hover:text-text'
          }`}
        >
          <Radio className="h-4 w-4" />
          Broadcast
        </button>
        <button
          onClick={() => setNotificationType('targeted')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
            notificationType === 'targeted'
              ? 'border-b-2 border-brand-500 text-brand-600'
              : 'text-textMuted hover:text-text'
          }`}
        >
          <Users className="h-4 w-4" />
          Targeted
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-textMuted">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No notifications sent yet</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Send First Notification
          </Button>
        </div>
      ) : (
        <Table data={notifications} columns={columns} />
      )}

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ title: '', message: '', type: 'INFO', targetRoles: [], targetUsers: [] });
        }}
        title="Send Notification"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Notification title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Notification message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="INFO">Info</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          {notificationType === 'targeted' && (
            <div>
              <label className="block text-sm font-medium mb-2">Target Roles</label>
              <select
                multiple
                value={formData.targetRoles}
                onChange={(e) => setFormData({
                  ...formData,
                  targetRoles: Array.from(e.target.selectedOptions, option => option.value),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="sales_agent">Sales Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification}>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notifications;

