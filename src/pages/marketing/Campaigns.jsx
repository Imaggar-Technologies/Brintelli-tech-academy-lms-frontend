import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Button from '../../components/Button';

const Campaigns = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-3xl border border-brintelli-border bg-white p-8 shadow-card backdrop-blur">
        <h1 className="text-2xl font-semibold text-text">All Campaigns</h1>
        <p className="mt-2 max-w-2xl text-sm text-textMuted">View and manage all marketing campaigns.</p>
        <div className="mt-6">
          <Button variant="secondary" size="sm" onClick={() => navigate('/marketing/assets')} className="gap-2">
            <FileText className="h-4 w-4" />
            Upload assets (High Value contacts & Student leads)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;

