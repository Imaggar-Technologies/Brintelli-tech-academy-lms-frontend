import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Presentation, RefreshCw, Calendar, Clock, Users, MapPin, Link2, User, CheckCircle, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import workshopAPI from '../../api/workshop';
import { selectCurrentUser } from '../../store/slices/authSlice';

const StudentWorkshops = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || currentUser?._id?.toString();
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await workshopAPI.getAllWorkshops();
      if (response.success) {
        setWorkshops(response.data.workshops || []);
      } else {
        toast.error(response.message || 'Failed to load workshops');
        setWorkshops([]);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast.error(error.message || 'Failed to load workshops');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = (workshop) => {
    const participants = workshop.participants || [];
    return participants.some((p) => (p?.toString?.() || p) === userId);
  };

  const canRegister = (workshop) => {
    const count = workshop.participantsCount ?? workshop.participants?.length ?? 0;
    const max = workshop.maxParticipants ?? 0;
    return max === 0 || count < max;
  };

  const handleRegister = async (id) => {
    try {
      const response = await workshopAPI.registerParticipant(id);
      if (response.success) {
        toast.success('You are registered for this workshop');
        fetchWorkshops();
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleUnregister = async (id) => {
    try {
      const response = await workshopAPI.unregisterParticipant(id);
      if (response.success) {
        toast.success('You have been unregistered');
        fetchWorkshops();
      } else {
        toast.error(response.message || 'Unregister failed');
      }
    } catch (error) {
      console.error('Error unregistering:', error);
      toast.error(error.message || 'Unregister failed');
    }
  };

  return (
    <>
      <PageHeader
        title="Workshops"
        description="Browse and register for workshops and events"
        actions={
          <Button variant="ghost" size="sm" onClick={fetchWorkshops}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : workshops.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-10 text-center">
          <Presentation className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No workshops available at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.map((workshop) => {
            const registered = isRegistered(workshop);
            const full = !canRegister(workshop);
            return (
              <div
                key={workshop.id || workshop._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/student/workshops/${workshop.id || workshop._id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/student/workshops/${workshop.id || workshop._id}`)}
                className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft hover:border-brand-500/30 transition-colors cursor-pointer"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-text">{workshop.title || 'Untitled Workshop'}</h3>
                      {workshop.subject && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-600">
                          {workshop.subject}
                        </span>
                      )}
                      {registered && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-600">
                          <CheckCircle className="h-3 w-3" /> Registered
                        </span>
                      )}
                    </div>
                    {workshop.description && (
                      <p className="text-sm text-textMuted mb-3 line-clamp-2">{workshop.description}</p>
                    )}
                    {Array.isArray(workshop.topics) && workshop.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {workshop.topics.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-brintelli-baseAlt text-xs text-textMuted">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-textMuted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {workshop.date || '—'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {workshop.time || '—'}
                        {workshop.duration && ` (${workshop.duration} min)`}
                      </span>
                      {workshop.tutorName && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {workshop.tutorName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        {workshop.deliveryMode || '—'}
                      </span>
                      {workshop.venue && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-[200px]" title={workshop.venue}>{workshop.venue}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {workshop.participantsCount ?? workshop.participants?.length ?? 0}
                        {workshop.maxParticipants ? ` / ${workshop.maxParticipants}` : ''}
                      </span>
                    </div>
                    {Array.isArray(workshop.resources) && workshop.resources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {workshop.resources.map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
                          >
                            <Link2 className="h-3 w-3" />
                            {r.label || 'Resource'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {registered ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleUnregister(workshop.id || workshop._id); }}
                      >
                        Unregister
                      </Button>
                    ) : full ? (
                      <span className="text-sm text-textMuted">Full</span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleRegister(workshop.id || workshop._id); }}
                      >
                        Register
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-textMuted" aria-hidden />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default StudentWorkshops;
