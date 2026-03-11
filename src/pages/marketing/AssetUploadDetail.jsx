import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import marketingAPI from '../../api/marketing';

function formatDate(d) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function statusLabel(status) {
  if (status === 'duplicate') return 'Duplicate';
  if (status === 'invalid') return 'Missing data';
  return 'New';
}

function statusClass(status) {
  if (status === 'duplicate') return 'bg-amber-100 text-amber-800 font-medium';
  if (status === 'invalid') return 'bg-rose-100 text-rose-800 font-medium';
  return 'bg-emerald-100 text-emerald-800 font-medium';
}

function rowClass(status) {
  if (status === 'duplicate') return 'bg-amber-50/80';
  if (status === 'invalid') return 'bg-rose-50/80';
  return '';
}

const AssetUploadDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batchId) {
      setError('Invalid batch');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    marketingAPI
      .getUploadBatchRows(batchId)
      .then((res) => {
        if (cancelled) return;
        setRows(res?.data?.rows ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load upload details');
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [batchId]);

  const isStudentLeads = rows.length === 0 || rows[0]?.type === 'student_leads';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Upload detail"
        description={batchId ? `All rows from this upload. Duplicates and missing data are marked.` : 'Upload batch'}
      />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/marketing/assets')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Asset Library
        </Button>
      </div>

      {loading && (
        <div className="rounded-xl border border-brintelli-border bg-white p-8 text-center text-textMuted">
          Loading…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div className="rounded-xl border border-brintelli-border bg-white p-8 text-center text-textMuted">
          No rows found for this upload.
        </div>
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-brintelli-border bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brintelli-baseAlt/60 sticky top-0">
                <tr>
                  {isStudentLeads && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-text">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Clg name</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Year of pass out</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Resume</th>
                    </>
                  )}
                  {!isStudentLeads && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-text">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-text">Institution</th>
                    </>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-text">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border">
                {rows.map((row, idx) => (
                  <tr key={row._id || idx} className={`hover:opacity-90 ${rowClass(row.status)}`}>
                    {isStudentLeads && (
                      <>
                        <td className="py-2 px-4 font-medium text-text">{row.name || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.clgName || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.department || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.yearOfPassOut || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.contact || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.email || '—'}</td>
                        <td className="py-2 px-4 text-text">
                          {row.resumeDriveLink ? (
                            <a href={row.resumeDriveLink} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate max-w-[140px] inline-block">
                              Link
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </>
                    )}
                    {!isStudentLeads && (
                      <>
                        <td className="py-2 px-4 text-text">{row.category || '—'}</td>
                        <td className="py-2 px-4 font-medium text-text">{row.name || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.contact || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.email || '—'}</td>
                        <td className="py-2 px-4 text-text">{row.institution || '—'}</td>
                      </>
                    )}
                    <td className="py-2 px-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${statusClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetUploadDetail;
