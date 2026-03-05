import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

const CheckEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Email is required to resend. Please sign up again.');
      return;
    }
    setResending(true);
    try {
      await authAPI.resendVerificationEmail(email.trim());
      toast.success('Verification email sent. Please check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <Mail className="h-10 w-10 text-brand-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-text mb-2">Check your email</h1>
        <p className="text-sm text-textMuted mb-4">
          We sent a verification link to <strong>{email || 'your email'}</strong>. Click the link to verify your account.
        </p>
        <p className="text-xs text-textMuted mb-6">
          The link expires in 24 hours. Didn’t receive it? Check spam or resend below.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email.trim()}
            className="rounded-xl border border-brand-500 bg-white px-6 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>
          <Link
            to="/auth/signin"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
