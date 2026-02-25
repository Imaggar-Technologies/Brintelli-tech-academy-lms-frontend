import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { 
  ClipboardCheck, 
  Award, 
  CreditCard, 
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  UserCheck,
  Loader2
} from "lucide-react";
import Button from "../../components/Button";
import toast from "react-hot-toast";
import { apiRequest } from "../../api/apiClient";
import studentAPI from "../../api/student";

const steps = [
  { id: 1, name: "Assessment", icon: ClipboardCheck, color: "blue" },
  { id: 2, name: "Scholarship", icon: Award, color: "purple" },
  { id: 3, name: "Payment", icon: CreditCard, color: "green" },
  { id: 4, name: "Done!", icon: CheckCircle2, color: "green" },
];

const EnrollmentFlow = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [leadId, setLeadId] = useState(null);
  const [assessmentToken, setAssessmentToken] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form data for each step
  const [formData, setFormData] = useState({
    assessment: {
      completed: false,
      score: null,
    },
    scholarship: {
      applied: false,
      eligibility: null,
      amount: null,
    },
    payment: {
      completed: false,
      amount: null,
      method: null,
    },
  });

  useEffect(() => {
    // Check enrollment status and load progress
    checkEnrollmentStatus();
    fetchLeadAndAssessmentInfo();
  }, [user]);

  const fetchLeadAndAssessmentInfo = async () => {
    if (!user?.email) return;
    
    try {
      const { leadAPI } = await import("../../api/lead");
      const response = await leadAPI.getLeadByEmail(user.email);
      
      if (response.success && response.data?.lead) {
        const lead = response.data.lead;
        setLeadId(lead.id);
        
        // Extract token from assessment link if available
        if (lead.assessmentLink) {
          try {
            const url = new URL(lead.assessmentLink);
            const token = url.searchParams.get('token');
            if (token) {
              setAssessmentToken(token);
            }
          } catch (e) {
            // If assessmentLink is not a full URL, try to extract token
            const match = lead.assessmentLink.match(/token=([^&]+)/);
            if (match) {
              setAssessmentToken(match[1]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching lead info:", error);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      // Check if student is already enrolled
      const enrollmentResponse = await studentAPI.getMyEnrollment();
      if (enrollmentResponse.success && enrollmentResponse.data?.enrollment) {
        // Student is already enrolled, redirect to dashboard
        navigate('/student/dashboard');
        return;
      }
      
      // Check if user has completed assessment
      // Check if user has applied for scholarship
      // Check if user has completed payment
      // Set completed steps accordingly
      
      // For now, we'll start from step 1
      // In production, fetch from API
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setLoading(true);
      
      try {
        // Save current step data
        await saveStepData(currentStep);
        
        // Mark step as completed
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        
        // Move to next step
        setCurrentStep(currentStep + 1);
        
        // If reached final step, complete enrollment
        if (currentStep + 1 === steps.length) {
          await completeEnrollment();
        }
      } catch (error) {
        console.error("Error saving step:", error);
        toast.error("Failed to save progress. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveStepData = async (step) => {
    // Save step data to backend
    // This would be API calls based on the step
    return Promise.resolve();
  };

  const completeEnrollment = async () => {
    try {
      // Complete enrollment process
      toast.success("Enrollment completed successfully!");
      // Redirect to dashboard after enrollment
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (error) {
      console.error("Error completing enrollment:", error);
      toast.error("Failed to complete enrollment. Please contact support.");
    }
  };

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) {
      return "completed";
    }
    if (currentStep === stepId) {
      return "current";
    }
    if (currentStep > stepId) {
      return "completed";
    }
    return "upcoming";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AssessmentStep 
          formData={formData.assessment} 
          setFormData={(data) => setFormData({...formData, assessment: data})}
          leadId={leadId}
          token={assessmentToken}
          navigate={navigate}
        />;
      case 2:
        return <ScholarshipStep formData={formData.scholarship} setFormData={(data) => setFormData({...formData, scholarship: data})} />;
      case 3:
        return <PaymentStep formData={formData.payment} setFormData={(data) => setFormData({...formData, payment: data})} />;
      case 4:
        return <CompletionStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">Brintelli Tech Academy</h1>
                <p className="text-sm text-textMuted">Complete your enrollment</p>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === "completed"
                          ? "bg-green-500 text-white shadow-lg"
                          : status === "current"
                          ? step.color === "blue"
                            ? "bg-blue-600 text-white shadow-lg scale-110"
                            : step.color === "purple"
                            ? "bg-purple-600 text-white shadow-lg scale-110"
                            : "bg-green-600 text-white shadow-lg scale-110"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {status === "completed" ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-xs font-medium ${
                          status === "current"
                            ? "text-gray-900"
                            : status === "completed"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Encouragement Message */}
          {currentStep < steps.length && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStep === 1 && "Let's start with your assessment!"}
                {currentStep === 2 && "Check your scholarship eligibility!"}
                {currentStep === 3 && "Complete your payment!"}
              </h2>
              <p className="text-gray-600">
                {currentStep === 1 && "Complete the assessment to evaluate your skills and determine the best program for you."}
                {currentStep === 2 && "Apply for available scholarships to reduce your course fees."}
                {currentStep === 3 && "Complete the payment to finalize your enrollment."}
              </p>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < steps.length && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 1 || loading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Assessment Step Component
const AssessmentStep = ({ formData, setFormData, leadId, token, navigate }) => {
  const [assessmentLink, setAssessmentLink] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Build assessment link if we have leadId and token
    if (leadId && token) {
      setAssessmentLink(`/assessment?leadId=${leadId}&token=${token}`);
    } else if (leadId) {
      // If no token, still navigate but assessment page will handle token generation
      setAssessmentLink(`/assessment?leadId=${leadId}`);
    }
  }, [leadId, token]);

  const handleStartAssessment = async () => {
    setLoading(true);
    try {
      // Build the navigation URL with available parameters
      const params = new URLSearchParams();
      if (leadId) {
        params.append('leadId', leadId);
      }
      if (token) {
        params.append('token', token);
      }
      
      const queryString = params.toString();
      const assessmentUrl = queryString ? `/assessment?${queryString}` : '/assessment';
      
      console.log('Navigating to assessment:', assessmentUrl);
      navigate(assessmentUrl);
    } catch (error) {
      console.error("Error starting assessment:", error);
      toast.error("Failed to start assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Status
          </label>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            {formData.completed ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Assessment Completed</span>
              </div>
            ) : (
              <div className="text-gray-600">
                <p className="mb-2">You need to complete the assessment first.</p>
                <Button
                  onClick={handleStartAssessment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? "Loading..." : "Start Assessment"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {formData.completed && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Score
            </label>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">{formData.score || "N/A"}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Scholarship Step Component
const ScholarshipStep = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scholarship Eligibility
          </label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Check Eligibility</option>
            <option>Eligible - 25% Scholarship</option>
            <option>Eligible - 50% Scholarship</option>
            <option>Not Eligible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scholarship Amount
          </label>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">₹{formData.amount || "0"}</p>
          </div>
        </div>
      </div>

      <div>
        <Button
          onClick={() => {
            setFormData({ ...formData, applied: true });
            toast.success("Scholarship application submitted!");
          }}
          disabled={formData.applied}
          className="w-full"
        >
          {formData.applied ? "Applied" : "Apply for Scholarship"}
        </Button>
      </div>
    </div>
  );
};

// Payment Step Component
const PaymentStep = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount
          </label>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">₹50,000</p>
            <p className="text-sm text-gray-600 mt-1">After scholarship: ₹37,500</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Select Payment Method</option>
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>UPI</option>
            <option>Net Banking</option>
          </select>
        </div>
      </div>

      <div>
        <Button
          onClick={() => {
            setFormData({ ...formData, completed: true });
            toast.success("Payment completed!");
          }}
          disabled={formData.completed}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {formData.completed ? "Payment Completed" : "Complete Payment"}
        </Button>
      </div>
    </div>
  );
};

// Completion Step Component
const CompletionStep = () => {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h2>
      <p className="text-lg text-gray-600 mb-8">
        Your enrollment has been completed successfully. You'll receive a confirmation email shortly.
      </p>
      <Button
        onClick={() => navigate('/student/dashboard')}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default EnrollmentFlow;

