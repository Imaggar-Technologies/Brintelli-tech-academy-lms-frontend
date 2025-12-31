import { useState } from 'react';
import { MessageSquare, Search, TrendingUp, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

const StudentForum = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <PageHeader
        title="Community Forum"
        description="Open discussion space for career questions, tech discussions, peer help, and general guidance"
        actions={
          <Button>New Post</Button>
        }
      />

      <div className="space-y-6">
        {/* Search Bar */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-textMuted" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-text placeholder:text-textMuted"
            />
          </div>
        </div>

        {/* Categories/Topics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold text-text">Trending</h3>
            </div>
            <p className="text-sm text-textMuted">Most active discussions</p>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold text-text">Recent</h3>
            </div>
            <p className="text-sm text-textMuted">Latest posts</p>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold text-text">My Posts</h3>
            </div>
            <p className="text-sm text-textMuted">Your discussions</p>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-12 text-center">
          <MessageSquare className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">Forum Coming Soon</h3>
          <p className="text-textMuted">
            The community forum is being set up. You'll be able to discuss career questions,
            tech topics, and get peer help here.
          </p>
        </div>
      </div>
    </>
  );
};

export default StudentForum;

