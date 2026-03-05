import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { authAPI } from '../../api/auth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification link is invalid or missing.');
      return;
    }
    authAPI
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified. You can now sign in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl text-center">
        <div className="mb-6 flex justify-center">
          {status === 'loading' && (
            <div className="h-16 w-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          )}
          {status === 'success' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold text-text mb-2">
          {status === 'loading' && 'Verifying your email...'}
          {status === 'success' && 'Email verified'}
          {status === 'error' && 'Verification failed'}
        </h1>
        <p className="text-sm text-textMuted mb-6">{message}</p>
        {(status === 'success' || status === 'error') && (
          <Link
            to="/auth/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Go to Sign In
          </Link>
        )}
        {status === 'error' && (
          <p className="mt-4 text-xs text-textMuted">
            You can request a new verification email from the sign-in page or after registering again.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
