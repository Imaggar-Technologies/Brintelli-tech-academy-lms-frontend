import { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  FileText, 
  UserPlus, 
  Key, 
  UserCog, 
  Shield, 
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { ticketAPI } from '../../api/tickets';
import { itUserAPI } from '../../api/itUsers';
import { auditAPI } from '../../api/audit';

const ITManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await itUserAPI.getUsers({ page: 1, limit: 100 });
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketAPI.getTickets({ page: 1, limit: 100 });
      if (data.success) {
        setTickets(data.data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await auditAPI.getAuditLogs({ page: 1, limit: 100 });
      if (data.success) {
        setAuditLogs(data.data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'tickets') {
      fetchTickets();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      OPEN: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      ON_HOLD: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      RESOLVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CLOSED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.OPEN;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConfig[priority] || priorityConfig.MEDIUM}`}>
        {priority}
      </span>
    );
  };

  return (
    <>
      <PageHeader
        title="IT Management"
        description="Manage users, support tickets, and view audit logs"
      />

      {/* Tabs */}
      <div className="mb-6 border-b border-brintelli-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'tickets', label: 'Support Tickets', icon: Ticket },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-textMuted hover:border-brintelli-border hover:text-text'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-brintelli-border bg-brintelli-card px-10 py-2.5 text-sm text-text placeholder:text-textMuted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <Button onClick={() => {/* Open create user modal */}} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          )}
          {activeTab === 'tickets' && (
            <Button variant="secondary" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="text-sm text-textMuted">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-brintelli-border bg-brintelli-baseAlt">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brintelli-border">
                    {users
                      .filter(user => 
                        !searchQuery || 
                        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-brintelli-baseAlt">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-text">{user.fullName || 'N/A'}</div>
                              <div className="text-sm text-textMuted">{user.email}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button className="rounded-lg p-1.5 text-textMuted hover:bg-brintelli-baseAlt hover:text-text">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="rounded-lg p-1.5 text-textMuted hover:bg-brintelli-baseAlt hover:text-text">
                                <Key className="h-4 w-4" />
                              </button>
                              <button className="rounded-lg p-1.5 text-textMuted hover:bg-brintelli-baseAlt hover:text-text">
                                <UserCog className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-textMuted" />
                  <p className="mt-2 text-sm text-textMuted">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {tickets
                .filter(ticket =>
                  !searchQuery ||
                  ticket.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  ticket.title?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-text">{ticket.title}</h3>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <p className="text-sm text-textMuted mb-3">{ticket.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-textMuted">
                          <span>Ticket: {ticket.ticketNumber}</span>
                          <span>Category: {ticket.category}</span>
                          {ticket.assignedTo && <span>Assigned To: {ticket.assignedTo}</span>}
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg p-2 text-textMuted hover:bg-brintelli-baseAlt hover:text-text">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-textMuted hover:bg-brintelli-baseAlt hover:text-text">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {tickets.length === 0 && (
                <div className="py-12 text-center rounded-2xl border border-brintelli-border bg-brintelli-card">
                  <Ticket className="mx-auto h-12 w-12 text-textMuted" />
                  <p className="mt-2 text-sm text-textMuted">No tickets found</p>
                </div>
              )}
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-brintelli-border bg-brintelli-baseAlt">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-textMuted">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brintelli-border">
                    {auditLogs
                      .filter(log =>
                        !searchQuery ||
                        log.action?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-brintelli-baseAlt">
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-sm font-medium text-text">{log.action}</span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-textMuted">
                            {log.userId}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-textMuted">
                            {log.targetUserId || log.targetTicketId || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-textMuted">
                            {log.ipAddress || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-textMuted">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {auditLogs.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-textMuted" />
                  <p className="mt-2 text-sm text-textMuted">No audit logs found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ITManagement;

