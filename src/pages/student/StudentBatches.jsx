import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FolderKanban, RefreshCw, Calendar, Users } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import lsmAPI from '../../api/lsm';

const StudentBatches = () => {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getAllBatches();
      if (response.success) {
        setBatches(response.data.batches || []);
      } else {
        toast.error(response.message || 'Failed to load batches');
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error(error.message || 'Failed to load batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <PageHeader
        title="All Batches"
        description="View all available batches across programs"
        actions={
          <button
            type="button"
            onClick={fetchBatches}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-textMuted hover:text-text"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : batches.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-10 text-center">
          <FolderKanban className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No batches available at the moment.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                    Batch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                    Start
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                    End
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                    Capacity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border/30">
                {batches.map((batch) => (
                  <tr
                    key={batch.id || batch._id}
                    className="transition-colors hover:bg-brintelli-baseAlt/20"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-text">
                        {batch.name || 'Unnamed Batch'}
                      </span>
                      {batch.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-textMuted">
                          {batch.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-textMuted">
                      {batch.programName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-textMuted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(batch.startDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-textMuted">
                      {formatDate(batch.endDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-textMuted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {batch.enrolled ?? 0} / {batch.capacity ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          batch.status === 'ACTIVE' || batch.status === 'ONGOING'
                            ? 'bg-green-500/10 text-green-600'
                            : batch.status === 'UPCOMING'
                            ? 'bg-brand-500/10 text-brand-600'
                            : 'bg-brintelli-baseAlt text-textMuted'
                        }`}
                      >
                        {batch.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentBatches;
