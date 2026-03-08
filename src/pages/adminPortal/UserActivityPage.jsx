import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Calendar, FileText, Trophy, LogIn, RefreshCw, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import { userActivityAPI } from '../../api/audit';
import apiRequest from '../../api/apiClient';
import toast from 'react-hot-toast';

const actionLabels = {
  login: 'Login',
  view_program: 'Viewed program',
  view_challenge: 'Viewed challenge',
  view_workshop: 'Viewed workshop',
};

const actionIcons = {
  login: LogIn,
  view_program: FileText,
  view_challenge: Trophy,
  view_workshop: FileText,
};

const UserActivityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(userIdFromUrl || '');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await apiRequest('/api/users/role/student?limit=500');
        const list = res?.data?.users || [];
        setUsers(list);
        if (userIdFromUrl && list.some((u) => u.id === userIdFromUrl || u._id === userIdFromUrl)) {
          setSelectedUserId(userIdFromUrl);
        } else if (!selectedUserId && list.length) {
          setSelectedUserId(list[0].id || list[0]._id);
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setActivities([]);
      return;
    }
    setLoading(true);
    userActivityAPI
      .getByUser(selectedUserId, { limit: 200 })
      .then((res) => {
        if (res?.success && res?.data?.activities) setActivities(res.data.activities);
        else setActivities([]);
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [selectedUserId, refreshKey]);

  const filteredUsers = search.trim()
    ? users.filter(
        (u) =>
          (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const columns = [
    {
      key: 'createdAt',
      label: 'Date & time',
      render: (val) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-textMuted" />
          {val ? new Date(val).toLocaleString() : '—'}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (val) => {
        const Icon = actionIcons[val] || FileText;
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-700">
            <Icon className="h-3.5 w-3.5" />
            {actionLabels[val] || val}
          </span>
        );
      },
    },
    {
      key: 'entityTitle',
      label: 'Details',
      render: (val, row) => (val || row.entityId || '—'),
    },
  ];

  const selectedUser = users.find((u) => (u.id || u._id) === selectedUserId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learner activity"
        description="View program, workshop, and login activity for learners. Admin and LSM only."
      />

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-4">
        <label className="block text-sm font-semibold text-text mb-2">Select learner</label>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm"
            />
          </div>
          <select
            value={selectedUserId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedUserId(id);
              setSearchParams(id ? { userId: id } : {});
            }}
            className="px-4 py-2 rounded-xl border border-brintelli-border bg-white text-sm font-medium"
          >
            <option value="">— Select user —</option>
            {filteredUsers.map((u) => {
              const id = u.id || u._id;
              return (
                <option key={id} value={id}>
                  {u.fullName || u.email || id}
                </option>
              );
            })}
          </select>
          <Button variant="ghost" size="sm" onClick={() => selectedUserId && setRefreshKey((k) => k + 1)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {selectedUser && (
          <p className="mt-2 text-sm text-textMuted flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {selectedUser.fullName} · {selectedUser.email}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : !selectedUserId ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center text-textMuted">
          Select a learner to see their activity.
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center text-textMuted">
          No activity recorded yet (logins and views of programs/workshops will appear here).
        </div>
      ) : (
        <Table data={activities} columns={columns} />
      )}
    </div>
  );
};

export default UserActivityPage;
