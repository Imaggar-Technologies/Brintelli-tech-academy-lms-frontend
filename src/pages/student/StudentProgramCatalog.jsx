import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { GraduationCap, RefreshCw, BookOpen, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import programAPI from '../../api/program';

const StudentProgramCatalog = () => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getAllPrograms({ status: 'ACTIVE' });
      if (response.success) {
        setPrograms(response.data.programs || []);
      } else {
        toast.error(response.message || 'Failed to load programs');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error(error.message || 'Failed to load programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="All Programs"
        description="Browse all programs offered by Brintelli Tech Academy"
        actions={
          <button
            type="button"
            onClick={fetchPrograms}
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
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-10 text-center">
          <GraduationCap className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No programs available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <div
              key={program.id || program._id}
              className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft hover:border-brand-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10">
                  <BookOpen className="h-5 w-5 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-text">
                    {program.name || 'Unnamed Program'}
                  </h3>
                  {program.code && (
                    <p className="mt-0.5 text-xs text-textMuted">{program.code}</p>
                  )}
                  {program.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-textMuted">
                      {program.description}
                    </p>
                  )}
                  {program.duration && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-textMuted">
                      <Clock className="h-3.5 w-3.5" />
                      {program.duration}
                    </p>
                  )}
                  {program.status && (
                    <span
                      className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        program.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-brintelli-baseAlt text-textMuted'
                      }`}
                    >
                      {program.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default StudentProgramCatalog;
