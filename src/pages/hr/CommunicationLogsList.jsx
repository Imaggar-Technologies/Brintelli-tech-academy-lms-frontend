import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { communicationLogsAPI } from '../../api/communicationLogs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const CommunicationLogsList = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await communicationLogsAPI.list();
      if (res.success && res.data?.logs) setLogs(res.data.logs);
      else setLogs([]);
    } catch (e) {
      toast.error(e.message || 'Failed to load communication logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Communication logs</h1>
        <Button variant="primary" onClick={() => navigate('/hr/communications/create')}>
          <Plus className="h-4 w-4 mr-2" /> Create notification
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <MessageSquare className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-4">No communication logs yet.</p>
          <Button variant="primary" onClick={() => navigate('/hr/communications/create')}>Create notification</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((l) => (
            <div key={l.id} className="rounded-xl border border-brintelli-border bg-brintelli-card p-4">
              <h3 className="font-semibold text-text">{l.title}</h3>
              <p className="text-sm text-textMuted mt-1 line-clamp-2">{l.message}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(l.audienceTypes || []).map((a) => (
                  <span key={a} className="px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-600 capitalize">{a}</span>
                ))}
              </div>
              <p className="text-xs text-textMuted mt-2">{new Date(l.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunicationLogsList;
