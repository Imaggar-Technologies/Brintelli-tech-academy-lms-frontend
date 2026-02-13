import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ClipboardList, Mail, Lock, UserPlus, CheckCircle, XCircle } from "lucide-react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { apiRequest } from "../../api/apiClient";
import toast from "react-hot-toast";

/**
 * Assessment Page Component
 * 
 * Handles token-based assessment access for leads.
 * If lead doesn't have an account, allows registration using the token.
 * Once registered/logged in, allows them to take the assessment test.
 */
const AssessmentPage = () => {
  const { leadId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [lead, setLead] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Verify token and get assessment details
  useEffect(() => {
    const verifyToken = async () => {
      if (!leadId || !token) {
        toast.error('Invalid assessment link. Missing lead ID or token.');
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);
        const response = await apiRequest(`/api/assessments/verify-token/${leadId}`, {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        if (response.success) {
          setAssessment(response.data.assessment);
          setLead(response.data.lead);
          
          // Check if lead already has an account
          if (response.data.lead?.userId) {
            // Lead has account, redirect to login or auto-login
            toast.success('Please sign in to take the assessment');
            navigate(`/auth/signin?redirect=/assessment/${leadId}?token=${token}`);
          } else {
            // Lead doesn't have account, pre-fill form data but don't auto-open modal
            setFormData(prev => ({
              ...prev,
              email: response.data.lead?.email || '',
              fullName: response.data.lead?.name || '',
              phone: response.data.lead?.phone || '',
            }));
            // Don't auto-open modal - let user click the register button
            // setShowRegisterModal(true);
          }
        } else {
          throw new Error(response.message || 'Invalid or expired assessment link');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        toast.error(error?.response?.data?.message || error.message || 'Invalid or expired assessment link');
        navigate('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [leadId, token, navigate]);

  // Handle registration with token
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setRegistering(true);
      const response = await apiRequest('/api/auth/register-with-token', {
        method: 'POST',
        body: JSON.stringify({
          token,
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      if (response.success) {
        toast.success('Registration successful! You can now take the assessment.');
        
        // Auto-login the user
        if (response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Store user data in Redux if available
          if (response.data.user) {
            // Dispatch user data to store if needed
            window.location.reload(); // Reload to initialize user session
          }
          
          // Redirect to assessment test page
          navigate(`/assessment/${leadId}/test?token=${token}`);
        } else if (response.data.token) {
          // Fallback for old API format
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          navigate(`/assessment/${leadId}/test?token=${token}`);
        } else {
          // If no token, redirect to login
          navigate(`/auth/signin?redirect=/assessment/${leadId}/test?token=${token}`);
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error?.response?.data?.message || error.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brintelli-baseAlt">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-textMuted">Verifying assessment link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brintelli-baseAlt p-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-8 shadow-soft">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 mb-4">
              <ClipboardList className="h-8 w-8 text-brand" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">Assessment Access</h1>
            <p className="text-sm text-textMuted">
              {lead?.name ? `Welcome, ${lead.name}!` : 'Welcome to your assessment'}
            </p>
          </div>

          {assessment && (
            <div className="space-y-4 mb-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Assessment Ready</p>
                    <p className="text-sm text-blue-700">
                      Your assessment link has been verified. {showRegisterModal ? 'Please complete your registration to access the assessment.' : 'Please register your account to continue.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showRegisterModal && (
            <div className="text-center space-y-4">
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 mb-4">
                <p className="text-sm font-medium text-brand-900 mb-2">
                  Create Your Student Account
                </p>
                <p className="text-xs text-brand-700">
                  To take your assessment, you need to create your student account. This will only take a minute!
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowRegisterModal(true)}
                className="w-full"
                size="lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Register Your Account
              </Button>
              <p className="text-xs text-textMuted mt-2">
                Already have an account?{' '}
                <button
                  onClick={() => navigate(`/auth/signin?redirect=/assessment/${leadId}?token=${token}`)}
                  className="text-brand hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
          // Don't navigate away, just close modal
        }}
        title="Create Your Student Account"
        size="md"
      >
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <strong>Welcome!</strong> Create your account to access your assessment. Your email ({lead?.email}) will be used for your account.
          </p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-brintelli-card text-text text-sm ${
                errors.fullName ? 'border-red-500' : 'border-brintelli-border'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-brintelli-card text-text text-sm ${
                errors.email ? 'border-red-500' : 'border-brintelli-border'
              }`}
              placeholder="Enter your email"
              disabled
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-textMuted mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-brintelli-card text-text text-sm ${
                errors.phone ? 'border-red-500' : 'border-brintelli-border'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-brintelli-card text-text text-sm ${
                errors.password ? 'border-red-500' : 'border-brintelli-border'
              }`}
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-brintelli-card text-text text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-brintelli-border'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRegisterModal(false);
                navigate('/auth/signin');
              }}
              disabled={registering}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={registering}>
              {registering ? 'Registering...' : 'Register & Continue'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssessmentPage;

