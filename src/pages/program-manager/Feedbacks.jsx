import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquareMore, Search, RefreshCw, Star, User, Calendar, Filter, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';
import programAPI from '../../api/program';

const Feedbacks = () => {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, session, tutor, program
  const [filterRating, setFilterRating] = useState('all'); // all, 1, 2, 3, 4, 5
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual feedbacks API
      // Mock data for now
      setFeedbacks([]);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.tutorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.sessionTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || feedback.type === filterType;
    const matchesRating = filterRating === 'all' || feedback.rating === parseInt(filterRating);

    return matchesSearch && matchesType && matchesRating;
  });

  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <PageHeader
        title="Feedbacks"
        description="View and manage feedbacks from students"
        actions={
          <Button variant="ghost" size="sm" onClick={fetchFeedbacks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search feedbacks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Types</option>
            <option value="session">Session Feedback</option>
            <option value="tutor">Tutor Feedback</option>
            <option value="program">Program Feedback</option>
          </select>
          <select
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
            <p className="text-textMuted">Loading feedbacks...</p>
          </div>
        ) : paginatedFeedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquareMore className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm || filterType !== 'all' || filterRating !== 'all'
                ? 'No feedbacks match your filters.'
                : 'No feedbacks found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-brintelli-border">
                <thead className="bg-brintelli-baseAlt/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Rating</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Comment</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Tutor</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Session</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Date</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedFeedbacks.map((feedback) => (
                    <tr key={feedback.id || feedback._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getRatingStars(feedback.rating || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          <p className="text-[11px] text-text line-clamp-2">
                            {feedback.comment || 'No comment'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-textMuted" />
                          <span className="text-[11px] text-textMuted">{feedback.tutorName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted">{feedback.sessionTitle || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-textMuted" />
                          <span className="text-[11px] text-textMuted">
                            {feedback.date
                              ? new Date(feedback.date).toLocaleDateString()
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setShowModal(true);
                          }}
                          className="px-2 py-1 text-[10px]"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="border-t border-brintelli-border p-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={filteredFeedbacks.length}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* View Feedback Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedFeedback(null);
        }}
        title="Feedback Details"
        size="lg"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {getRatingStars(selectedFeedback.rating || 0)}
                <span className="ml-2 text-sm text-textMuted">
                  ({selectedFeedback.rating || 0} / 5)
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Comment</label>
              <p className="text-sm text-text bg-gray-50 p-3 rounded-lg">
                {selectedFeedback.comment || 'No comment provided'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tutor</label>
                <p className="text-sm text-textMuted">{selectedFeedback.tutorName || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Session</label>
                <p className="text-sm text-textMuted">{selectedFeedback.sessionTitle || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <p className="text-sm text-textMuted">
                  {selectedFeedback.date
                    ? new Date(selectedFeedback.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Type</label>
                <p className="text-sm text-textMuted capitalize">{selectedFeedback.type || '—'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="ghost" onClick={() => {
                setShowModal(false);
                setSelectedFeedback(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Feedbacks;




