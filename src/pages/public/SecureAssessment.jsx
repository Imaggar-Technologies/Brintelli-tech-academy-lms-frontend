import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  Clock, 
  Code, 
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import Button from "../../components/Button";
import toast from "react-hot-toast";
import { apiRequest } from "../../api/apiClient";

const TOTAL_MCQ = 15;
const TOTAL_CODING = 5;
const TOTAL_TIME = 120 * 60; // 120 minutes in seconds

const SecureAssessment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector(selectCurrentUser);
  const [token, setToken] = useState(searchParams.get('token'));
  const [leadId, setLeadId] = useState(searchParams.get('leadId'));

  // Proctoring state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Assessment state
  const [started, setStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState('mcq'); // 'mcq' or 'coding'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [answers, setAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
  
  // Media streams
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Request media access on component mount (before starting assessment)
  useEffect(() => {
    if (!started) {
      requestMediaAccess();
    }
  }, []); // Run once on mount

  // Initialize proctoring when assessment starts
  useEffect(() => {
    if (started) {
      // Ensure media is still active
      if (!cameraEnabled || !micEnabled) {
        requestMediaAccess();
      }
      setupTabSwitchDetection();
      setupFullscreenDetection();
      startTimer();
    }

    return () => {
      if (started) {
        cleanup();
      }
    };
  }, [started]);

  // Timer countdown
  useEffect(() => {
    if (started && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [started, timeRemaining]);

  const requestMediaAccess = async () => {
    try {
      console.log("Requesting camera and microphone access...");
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });

      console.log("Media access granted, stream:", stream);
      streamRef.current = stream;
      
      // Check if video track is active
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack && videoTrack.readyState === 'live') {
        setCameraEnabled(true);
        console.log("Camera enabled:", videoTrack.label);
      } else {
        setCameraEnabled(false);
        console.warn("Video track not active");
      }
      
      if (audioTrack && audioTrack.readyState === 'live') {
        setMicEnabled(true);
        console.log("Microphone enabled:", audioTrack.label);
      } else {
        setMicEnabled(false);
        console.warn("Audio track not active");
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
        });
      }
    } catch (error) {
      console.error("Error accessing media:", error);
      let errorMessage = "Camera and microphone access is required for this assessment";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Please allow camera and microphone access in your browser settings and refresh the page.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No camera or microphone found. Please connect a camera and microphone.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "Camera or microphone is being used by another application. Please close other apps and try again.";
      } else if (error.message.includes('not supported')) {
        errorMessage = "Your browser does not support camera/microphone access. Please use Chrome, Firefox, or Edge.";
      }
      
      toast.error(errorMessage);
      setCameraEnabled(false);
      setMicEnabled(false);
    }
  };

  const setupTabSwitchDetection = () => {
    // Detect tab visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Detect window blur (tab switch or window minimize)
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    
    // Prevent context menu (right-click)
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    
    // Prevent keyboard shortcuts
    document.addEventListener("keydown", handleKeyDown);
    
    // Prevent copy/paste
    document.addEventListener("copy", (e) => e.preventDefault());
    document.addEventListener("paste", (e) => e.preventDefault());
    document.addEventListener("cut", (e) => e.preventDefault());
  };

  const handleVisibilityChange = () => {
    if (document.hidden && started) {
      handleTabSwitch();
    }
  };

  const handleWindowBlur = () => {
    if (started) {
      handleTabSwitch();
    }
  };

  const handleWindowFocus = () => {
    // Reset warning timeout when user comes back
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  };

  const handleTabSwitch = () => {
    const newCount = tabSwitches + 1;
    setTabSwitches(newCount);
    
    const warning = {
      id: Date.now(),
      message: `Tab switch detected (${newCount}). Multiple violations may result in assessment termination.`,
      type: "error",
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setWarnings((prev) => [...prev, warning]);
    
    // Show alert and bring focus back
    alert(`WARNING: Tab switching is not allowed! This is violation #${newCount}.`);
    window.focus();
    
    // Auto-submit after 3 violations
    if (newCount >= 3) {
      toast.error("Assessment terminated due to multiple tab switches");
      handleSubmit(true);
    }
  };

  const handleKeyDown = (e) => {
    // Block common shortcuts
    const blockedKeys = [
      "F12", // Developer tools
      "F5", // Refresh
      "F11", // Fullscreen toggle
    ];
    
    const blockedCombos = [
      { ctrl: true, key: "r" }, // Refresh
      { ctrl: true, key: "R" },
      { ctrl: true, shift: true, key: "I" }, // Dev tools
      { ctrl: true, shift: true, key: "J" }, // Console
      { ctrl: true, shift: true, key: "C" }, // Console
      { ctrl: true, key: "u" }, // View source
      { ctrl: true, key: "s" }, // Save
      { alt: true, key: "Tab" }, // Switch apps
      { ctrl: true, key: "Tab" }, // Switch tabs
    ];

    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      toast.error("This action is not allowed during assessment");
      return;
    }

    for (const combo of blockedCombos) {
      if (
        (combo.ctrl && !e.ctrlKey) ||
        (combo.shift && !e.shiftKey) ||
        (combo.alt && !e.altKey) ||
        combo.key.toLowerCase() !== e.key.toLowerCase()
      ) {
        continue;
      }
      e.preventDefault();
      toast.error("Keyboard shortcuts are disabled during assessment");
      return;
    }
  };

  const setupFullscreenDetection = () => {
    document.addEventListener("fullscreenchange", () => {
      setIsFullscreen(!!document.fullscreenElement);
    });
    
    document.addEventListener("webkitfullscreenchange", () => {
      setIsFullscreen(!!document.webkitFullscreenElement);
    });
    
    document.addEventListener("mozfullscreenchange", () => {
      setIsFullscreen(!!document.mozFullScreenElement);
    });
  };

  const startTimer = () => {
    // Timer is handled in useEffect
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("focus", handleWindowFocus);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  };

  const handleStart = async () => {
    // Re-request media access if not enabled
    if (!cameraEnabled || !micEnabled) {
      toast.info("Requesting camera and microphone access...");
      await requestMediaAccess();
      
      // Wait a moment for the state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!cameraEnabled || !micEnabled) {
        toast.error("Please enable camera and microphone to continue. Click the 'Request Access' button above.");
        return;
      }
    }

    // Request fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      // Don't block if fullscreen fails
    }

    setStarted(true);
    toast.success("Assessment started! Good luck!");
  };

  const handleSubmit = async (forced = false) => {
    cleanup();
    
    try {
      const response = await apiRequest(`/api/assessments/submit`, {
        method: "POST",
        body: JSON.stringify({
          leadId,
          token,
          answers,
          codingAnswers,
          timeSpent: TOTAL_TIME - timeRemaining,
          tabSwitches,
          warnings: warnings.length,
          forced,
        }),
      });

      if (response.success) {
        toast.success("Assessment submitted successfully!");
        navigate(`/assessment/${leadId}/result?token=${token}`);
      } else {
        toast.error(response.message || "Failed to submit assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment. Please contact support.");
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Mock questions - replace with API call
  const mcqQuestions = Array.from({ length: TOTAL_MCQ }, (_, i) => ({
    id: i + 1,
    question: `MCQ Question ${i + 1}: What is the output of the following code?`,
    options: [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
      { value: "c", label: "Option C" },
      { value: "d", label: "Option D" },
    ],
  }));

  const codingQuestions = Array.from({ length: TOTAL_CODING }, (_, i) => ({
    id: i + 1,
    question: `Coding Question ${i + 1}: Write a function to solve the following problem...`,
    language: "javascript",
    starterCode: `function solution() {\n  // Your code here\n}`,
  }));

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Assessment</h1>
            <p className="text-gray-600">Please enable camera and microphone to begin</p>
          </div>

          {/* Camera Preview */}
          <div className="mb-6">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover bg-gray-900"
                style={{ display: cameraEnabled ? 'block' : 'none' }}
              />
              {!cameraEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                  <VideoOff className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-400 text-sm">Camera preview will appear here</p>
                  <p className="text-gray-500 text-xs mt-2">Allow access when prompted</p>
                </div>
              )}
            </div>
            {!cameraEnabled && (
              <button
                onClick={requestMediaAccess}
                className="mt-2 w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Camera & Microphone Access
              </button>
            )}
          </div>

          {/* Media Status */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {cameraEnabled ? (
                  <Video className="h-5 w-5 text-green-500" />
                ) : (
                  <VideoOff className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Camera</span>
              </div>
              <span className={cameraEnabled ? "text-green-600" : "text-red-600"}>
                {cameraEnabled ? "Enabled" : "Not Enabled"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {micEnabled ? (
                  <Mic className="h-5 w-5 text-green-500" />
                ) : (
                  <MicOff className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">Microphone</span>
              </div>
              <span className={micEnabled ? "text-green-600" : "text-red-600"}>
                {micEnabled ? "Enabled" : "Not Enabled"}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Important Instructions
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Do not switch tabs or minimize the window</li>
              <li>Keep your camera and microphone on throughout the assessment</li>
              <li>You have 120 minutes to complete 15 MCQ and 5 coding questions</li>
              <li>Tab switching will result in warnings and may terminate the assessment</li>
              <li>Keyboard shortcuts are disabled</li>
            </ul>
          </div>

          <Button
            onClick={handleStart}
            disabled={!cameraEnabled || !micEnabled}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestions = currentSection === 'mcq' ? mcqQuestions : codingQuestions;
  const currentQ = currentQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            <span className="font-mono text-lg font-bold text-red-600">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm text-gray-600">
            {currentSection === 'mcq' 
              ? `MCQ: ${currentQuestion + 1}/${TOTAL_MCQ}`
              : `Coding: ${currentQuestion + 1}/${TOTAL_CODING}`
            }
          </span>
        </div>

        <div className="flex items-center gap-4">
          {tabSwitches > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Violations: {tabSwitches}/3</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {cameraEnabled ? (
              <Video className="h-5 w-5 text-green-500" />
            ) : (
              <VideoOff className="h-5 w-5 text-red-500" />
            )}
            {micEnabled ? (
              <Mic className="h-5 w-5 text-green-500" />
            ) : (
              <MicOff className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">
              {warnings[warnings.length - 1].message}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Question Navigation */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <div className="mb-4">
                <Button
                  variant={currentSection === 'mcq' ? 'primary' : 'ghost'}
                  onClick={() => {
                    setCurrentSection('mcq');
                    setCurrentQuestion(0);
                  }}
                  className="w-full mb-2"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  MCQ ({TOTAL_MCQ})
                </Button>
                <Button
                  variant={currentSection === 'coding' ? 'primary' : 'ghost'}
                  onClick={() => {
                    setCurrentSection('coding');
                    setCurrentQuestion(0);
                  }}
                  className="w-full"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Coding ({TOTAL_CODING})
                </Button>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {currentSection === 'mcq' ? 'MCQ Questions' : 'Coding Questions'}
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {currentQuestions.map((q, idx) => {
                    const hasAnswer = currentSection === 'mcq' 
                      ? answers[q.id] 
                      : codingAnswers[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(idx)}
                        className={`h-10 rounded-lg border text-xs font-medium transition ${
                          currentQuestion === idx
                            ? "border-blue-600 bg-blue-600 text-white"
                            : hasAnswer
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => handleSubmit(false)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Submit Assessment
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {currentSection === 'mcq' ? (
                <MCQQuestion
                  question={currentQ}
                  answer={answers[currentQ.id]}
                  onAnswerChange={(answer) => {
                    setAnswers({ ...answers, [currentQ.id]: answer });
                  }}
                />
              ) : (
                <CodingQuestion
                  question={currentQ}
                  answer={codingAnswers[currentQ.id]}
                  onAnswerChange={(answer) => {
                    setCodingAnswers({ ...codingAnswers, [currentQ.id]: answer });
                  }}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    if (currentQuestion < currentQuestions.length - 1) {
                      setCurrentQuestion(currentQuestion + 1);
                    } else if (currentSection === 'mcq') {
                      setCurrentSection('coding');
                      setCurrentQuestion(0);
                    }
                  }}
                  disabled={currentQuestion === currentQuestions.length - 1 && currentSection === 'coding'}
                >
                  {currentQuestion === currentQuestions.length - 1 && currentSection === 'mcq'
                    ? 'Go to Coding'
                    : currentQuestion === currentQuestions.length - 1
                    ? 'Review'
                    : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Preview - Small */}
      <div className="fixed bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

// MCQ Question Component
const MCQQuestion = ({ question, answer, onAnswerChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {question.question}
      </h2>
      <div className="space-y-3">
        {question.options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
              answer === option.value
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={answer === option.value}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="h-5 w-5 text-blue-600"
            />
            <span className="text-gray-900">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Coding Question Component
const CodingQuestion = ({ question, answer, onAnswerChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {question.question}
      </h2>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write your solution:
        </label>
        <textarea
          value={answer || question.starterCode}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your code here..."
        />
      </div>
    </div>
  );
};

export default SecureAssessment;

