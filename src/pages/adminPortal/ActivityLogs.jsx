import { useState, useEffect } from 'react';
import { ClipboardCheck, Search, Filter, RefreshCw, Eye, Calendar, User, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { auditAPI } from '../../api/audit';
import { useDataFetch } from '../../hooks/useDataFetch';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchLogs = async () => {
    const filters = {};
    if (dateRange.start) filters.startDate = dateRange.start;
    if (dateRange.end) filters.endDate = dateRange.end;
    if (actionFilter) filters.action = actionFilter;
    if (userFilter) filters.userId = userFilter;
    
    const response = await auditAPI.getAuditLogs({ ...filters, limit: 100 });
    if (response.success) {
      return response.data?.logs || [];
    }
    return [];
  };

  const { data: logs = [], loading, error, refetch } = useDataFetch(fetchLogs, {
    errorMessage: 'Failed to load activity logs',
    maxRetries: 3,
    dependencies: [actionFilter, userFilter, dateRange.start, dateRange.end],
  });

  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!log.user?.name?.toLowerCase().includes(query) &&
          !log.action?.toLowerCase().includes(query) &&
          !log.details?.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action).filter(Boolean))];

  const columns = [
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-textMuted" />
          <span className="text-sm">
            {value ? new Date(value).toLocaleString() : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-textMuted" />
          <span className="text-sm">{value?.name || value?.email || 'System'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (value, row) => (
        <div className="max-w-md">
          <p className="text-sm text-text truncate">
            {value || JSON.stringify(row.metadata || {})}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedLog(row);
            setShowLogModal(true);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="View system activity and audit logs"
        actions={
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Actions</option>
          {uniqueActions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
          placeholder="End Date"
        />
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-textMuted">Loading activity logs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 mb-4">Failed to load activity logs</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No activity logs found</p>
        </div>
      ) : (
        <Table data={filteredLogs} columns={columns} />
      )}

      {/* Log Details Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setSelectedLog(null);
        }}
        title="Activity Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Timestamp</label>
              <p className="text-text">
                {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">User</label>
              <p className="text-text">
                {selectedLog.user?.name || selectedLog.user?.email || 'System'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <p className="text-text">{selectedLog.action || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Details</label>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                {JSON.stringify(selectedLog.metadata || selectedLog.details || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityLogs;

