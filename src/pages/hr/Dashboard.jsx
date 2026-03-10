import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, List } from 'lucide-react';
import Button from '../../components/Button';

const HrDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">HR Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className="rounded-xl border border-brintelli-border bg-brintelli-card p-6 hover:border-brand-500/30 transition-colors cursor-pointer"
          onClick={() => navigate('/hr/jobs')}
        >
          <div className="flex items-center gap-3 mb-2">
            <List className="h-8 w-8 text-brand-500" />
            <h2 className="text-lg font-semibold text-text">Job postings</h2>
          </div>
          <p className="text-sm text-textMuted mb-4">View and manage all job postings.</p>
          <Button variant="secondary" size="sm">
            View jobs
          </Button>
        </div>
        <div
          className="rounded-xl border border-brintelli-border bg-brintelli-card p-6 hover:border-brand-500/30 transition-colors cursor-pointer"
          onClick={() => navigate('/hr/jobs/create')}
        >
          <div className="flex items-center gap-3 mb-2">
            <Plus className="h-8 w-8 text-brand-500" />
            <h2 className="text-lg font-semibold text-text">Create job</h2>
          </div>
          <p className="text-sm text-textMuted mb-4">Post a new job opening.</p>
          <Button variant="primary" size="sm">
            Create job
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
