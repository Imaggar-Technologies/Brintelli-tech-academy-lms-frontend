import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Presentation, Calendar, Clock, User, Users, MapPin, RefreshCw } from 'lucide-react';
import { getPublicUpcomingWorkshops } from '../../api/workshop';
import workshopAPI from '../../api/workshop';
import { selectCurrentUser } from '../../store/slices/authSlice';
import Button from '../../components/Button';

const UpcomingWorkshops = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || currentUser?._id?.toString();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    fetchWorkshops();
  }, [userId]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      // When logged in, use authenticated API so we get participants (for "Registered" badge)
      if (userId) {
        const res = await workshopAPI.getAllWorkshops({});
        const list = res.success && res.data?.workshops ? res.data.workshops : [];
        const today = new Date().toISOString().split('T')[0];
        setWorkshops(list.filter((w) => w.date >= today).sort((a, b) => (a.date || '').localeCompare(b.date || '')));
      } else {
        const res = await getPublicUpcomingWorkshops();
        if (res.success && res.data?.workshops) setWorkshops(res.data.workshops);
        else setWorkshops([]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load workshops');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshop) => {
    if (!userId) {
      navigate(`/auth/signup?redirect=${encodeURIComponent('/upcoming-workshops')}`);
      return;
    }
    const id = workshop.id || workshop._id;
    setRegisteringId(id);
    try {
      const res = await workshopAPI.registerParticipant(id);
      if (res.success) {
        toast.success("You're registered for this workshop!");
        fetchWorkshops();
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (e) {
      toast.error(e.message || 'Registration failed');
    } finally {
      setRegisteringId(null);
    }
  };

  const isRegistered = (workshop) => {
    if (!userId) return false;
    const participants = workshop.participants || [];
    return participants.some((p) => (p?.toString?.() || p) === userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text mb-2">Upcoming Workshops</h1>
          <p className="text-textMuted">
            Register for workshops and events. Sign in or create an account to register.
          </p>
        </div>

        {!currentUser && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-brand-800">
              Create an account or sign in to register for workshops.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth/signin')}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/auth/signup')}>
                Create account
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : workshops.length === 0 ? (
          <div className="rounded-2xl border border-brintelli-border bg-white p-12 text-center">
            <Presentation className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No upcoming workshops at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workshops.map((workshop) => {
              const registered = isRegistered(workshop);
              const full = (workshop.participantsCount ?? 0) >= (workshop.maxParticipants || 999);
              return (
                <div
                  key={workshop.id || workshop._id}
                  className="rounded-2xl border border-brintelli-border bg-white p-5 shadow-sm hover:border-brand-500/30 transition-colors"
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
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-600">
                            Registered
                          </span>
                        )}
                      </div>
                      {workshop.description && (
                        <p className="text-sm text-textMuted mb-3 line-clamp-2">{workshop.description}</p>
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
                          <Users className="h-4 w-4" />
                          {workshop.participantsCount ?? 0} / {workshop.maxParticipants || '—'}
                        </span>
                        {workshop.venue && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {workshop.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {registered ? (
                        <Button variant="secondary" size="sm" onClick={() => navigate('/student/workshops')}>
                          View in dashboard
                        </Button>
                      ) : full ? (
                        <span className="text-sm text-textMuted">Full</span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRegister(workshop)}
                          disabled={registeringId === (workshop.id || workshop._id)}
                        >
                          {registeringId === (workshop.id || workshop._id) ? 'Registering...' : 'Register'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/auth/signin')}>
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingWorkshops;
