import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Calendar, Users } from 'lucide-react';
import Button from './Button';
import studentAPI from '../api/student';

/**
 * OnboardingGuard - Checks if student has completed onboarding
 * Redirects to onboarding page if batch or mentor is not confirmed
 */
const OnboardingGuard = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const response = await studentAPI.getMyEnrollment();
      if (response.success && response.data.enrollment) {
        const enroll = response.data.enrollment;
        setEnrollment(enroll);
        setOnboardingComplete(enroll.isOnboardingComplete === true);
      } else {
        // No enrollment found - allow access (they'll see empty states)
        setOnboardingComplete(true);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // On error, allow access (fail open)
      setOnboardingComplete(true);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!onboardingComplete && enrollment) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-2">Complete Your Onboarding</h2>
            <p className="text-textMuted">
              Please confirm your batch and select your mentor to access sessions and assignments.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={`p-4 rounded-lg border-2 ${
              enrollment.batchConfirmed
                ? 'border-green-500 bg-green-50/30'
                : 'border-yellow-500 bg-yellow-50/30'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {enrollment.batchConfirmed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Calendar className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-semibold text-text">Batch</span>
              </div>
              <p className="text-sm text-textMuted">
                {enrollment.batchConfirmed ? 'Confirmed' : 'Not Confirmed'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              enrollment.mentorId
                ? 'border-green-500 bg-green-50/30'
                : 'border-yellow-500 bg-yellow-50/30'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {enrollment.mentorId ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Users className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-semibold text-text">Mentor</span>
              </div>
              <p className="text-sm text-textMuted">
                {enrollment.mentorId ? 'Selected' : 'Not Selected'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={() => navigate('/student/onboarding')}>
              Complete Onboarding
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default OnboardingGuard;

