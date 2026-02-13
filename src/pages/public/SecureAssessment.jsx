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
import Modal from "../../components/Modal";
import AssessmentLayout from "../../components/assessment/AssessmentLayout";
import { AssessmentProvider } from "../../contexts/AssessmentContext";
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
  const [permissionError, setPermissionError] = useState(null);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState(null);
  const audioRef = useRef(null);
  
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
    if (started && timeRemaining > 0 && !isPaused && isFullscreen) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Clear interval if paused or not in fullscreen
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [started, timeRemaining, isPaused, isFullscreen]);

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
      setPermissionError(error.name);
    }
  };

  // Check current permissions
  const checkPermissions = async () => {
    try {
      if (navigator.permissions) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' });
        
        console.log('Camera permission:', cameraPermission.state);
        console.log('Microphone permission:', microphonePermission.state);
        
        if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
          setPermissionError('denied');
          return false;
        }
        return true;
      }
    } catch (error) {
      console.log('Permission API not supported or error:', error);
    }
    return null;
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
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      // If user exits fullscreen during assessment
      if (started && !isCurrentlyFullscreen && isFullscreen) {
        handleFullscreenExit();
      }
      
      // If user re-enters fullscreen
      if (started && isCurrentlyFullscreen && !isFullscreen && isPaused) {
        setIsPaused(false);
        setShowFullscreenModal(false);
        toast.success("Fullscreen mode restored. Assessment resumed.");
      }
      
      setIsFullscreen(isCurrentlyFullscreen);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  };

  const handleFullscreenExit = () => {
    if (!started) return;
    
    // Pause the timer
    setIsPaused(true);
    setPausedTimeRemaining(timeRemaining);
    
    // Stop the timer interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Play alert sound
    playAlertSound();
    
    // Show modal
    setShowFullscreenModal(true);
    
    // Add warning
    const warning = {
      id: Date.now(),
      message: "Fullscreen mode exited. Assessment paused.",
      type: "error",
      timestamp: new Date().toLocaleTimeString(),
    };
    setWarnings((prev) => [...prev, warning]);
  };

  const playAlertSound = () => {
    try {
      // Create audio context for beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Beep frequency
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Play second beep after short delay
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 800;
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.5);
      }, 300);
    } catch (error) {
      console.error("Error playing alert sound:", error);
    }
  };

  const handleReenterFullscreen = async () => {
    try {
      let entered = false;
      
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        entered = true;
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
        entered = true;
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
        entered = true;
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
        entered = true;
      }
      
      if (entered) {
        // Resume the timer
        setIsPaused(false);
        setShowFullscreenModal(false);
        
        // Restart timer if time remaining
        if (pausedTimeRemaining !== null && pausedTimeRemaining > 0) {
          setTimeRemaining(pausedTimeRemaining);
        }
        
        toast.success("Fullscreen mode restored. Assessment resumed.");
      } else {
        toast.error("Unable to enter fullscreen mode. Please press F11 or use browser menu.");
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
      toast.error("Unable to enter fullscreen mode. Please press F11 or use browser menu.");
    }
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
    id: `mcq-${i + 1}`,
    type: i % 3 === 0 ? 'multiple' : 'single', // Every 3rd question is multiple choice
    allowMultiple: i % 3 === 0,
    question: `MCQ Question ${i + 1}: What is the output of the following code?`,
    options: [
      { value: "a", label: "Option A", description: i === 0 ? "First option description" : null },
      { value: "b", label: "Option B" },
      { value: "c", label: "Option C" },
      { value: "d", label: "Option D" },
    ],
  }));

  const codingQuestions = Array.from({ length: TOTAL_CODING }, (_, i) => ({
    id: `coding-${i + 1}`,
    type: 'coding',
    question: `Coding Question ${i + 1}`,
    problemData: {
      title: `Coding Question ${i + 1}`,
      description: `Write a function to solve the following problem:\n\nGiven an array of integers, find the maximum sum of a contiguous subarray.\n\nExample:\nInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: The subarray [4, -1, 2, 1] has the largest sum = 6.`,
      inputFormat: 'The first line contains an integer n (1 ≤ n ≤ 10^5).\nThe second line contains n space-separated integers.',
      outputFormat: 'Print a single integer representing the maximum sum.',
      constraints: [
        '1 ≤ n ≤ 10^5',
        '-10^9 ≤ arr[i] ≤ 10^9',
      ],
      sampleCases: [
        {
          input: '9\n-2 1 -3 4 -1 2 1 -5 4',
          output: '6',
          explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6.',
        },
        {
          input: '5\n1 2 3 4 5',
          output: '15',
          explanation: 'The entire array has the maximum sum.',
        },
      ],
    },
    language: "javascript",
    starterCode: `function solution(arr) {\n  // Your code here\n  return 0;\n}`,
  }));

  // Handler for running code
  const handleRunCode = async (questionId, code, language, customInput) => {
    // TODO: Integrate with actual code execution API
    // For now, simulate execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'success',
      stdout: 'Code executed successfully',
      stderr: '',
      executionTime: '48ms',
      memory: '45MB',
      testCases: [
        {
          passed: true,
          executionTime: '12ms',
        },
        {
          passed: true,
          executionTime: '15ms',
        },
      ],
    };
  };

  // Handler for submitting code
  const handleSubmitCode = async (questionId, code, language) => {
    // Mark question as answered in context
    // The actual submission will happen when the user clicks "Submit Assessment"
    console.log('Code submitted for question:', questionId);
    return Promise.resolve();
  };

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

          {/* Permission Error Instructions */}
          {(!cameraEnabled || !micEnabled) && permissionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Camera & Microphone Access Required
              </h3>
              <div className="text-sm text-red-800 space-y-3">
                <p className="font-medium">To enable camera and microphone access:</p>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold mb-1">Chrome/Edge:</p>
                    <ol className="list-decimal list-inside ml-2 space-y-1 text-xs">
                      <li>Click the lock icon (🔒) or camera icon in the address bar</li>
                      <li>Set Camera and Microphone to "Allow"</li>
                      <li>Refresh the page or click "Try Again" below</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Firefox:</p>
                    <ol className="list-decimal list-inside ml-2 space-y-1 text-xs">
                      <li>Click the shield icon in the address bar</li>
                      <li>Click "Permissions" → Allow Camera and Microphone</li>
                      <li>Refresh the page or click "Try Again" below</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Safari:</p>
                    <ol className="list-decimal list-inside ml-2 space-y-1 text-xs">
                      <li>Go to Safari → Settings → Websites → Camera/Microphone</li>
                      <li>Set to "Allow" for this site</li>
                      <li>Refresh the page or click "Try Again" below</li>
                    </ol>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPermissionError(null);
                    requestMediaAccess();
                  }}
                  className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Try Again After Enabling Permissions
                </button>
              </div>
            </div>
          )}

          {/* Regular Instructions */}
          {(!permissionError || (cameraEnabled && micEnabled)) && (
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
          )}

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

  return (
    <>
      {/* Fullscreen Exit Modal */}
      {showFullscreenModal && (
        <Modal
          isOpen={showFullscreenModal}
          onClose={() => {}} // Prevent closing without fullscreen
          title="Fullscreen Mode Required"
          size="md"
        >
          <div className="space-y-6">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Assessment Paused
              </h3>
              <p className="text-gray-600 mb-4">
                You have exited fullscreen mode. The assessment has been paused.
              </p>
            </div>

            {/* Time Remaining Display */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Time Remaining</p>
              <p className="text-3xl font-mono font-bold text-red-600">
                {formatTime(pausedTimeRemaining !== null ? pausedTimeRemaining : timeRemaining)}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Fullscreen mode is required to continue the assessment</li>
                <li>Click the button below to re-enter fullscreen mode</li>
                <li>Alternatively, press F11 on your keyboard</li>
                <li>The timer will resume once fullscreen is restored</li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleReenterFullscreen}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Enter Fullscreen Mode
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              The assessment will remain paused until fullscreen mode is restored.
            </p>
          </div>
        </Modal>
      )}

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

      <div className={`${isPaused ? 'pointer-events-none opacity-50' : ''}`}>
        <AssessmentProvider 
          questions={[...mcqQuestions, ...codingQuestions].map((q, index) => ({
            ...q,
            questionNumber: index + 1,
          }))}
          activeSection={currentSection}
        >
          <AssessmentLayout
            questions={[...mcqQuestions, ...codingQuestions]}
            activeSection={currentSection}
            onSectionChange={(section) => {
              setCurrentSection(section);
            }}
            onSubmit={() => handleSubmit(false)}
            onRunCode={handleRunCode}
            onSubmitCode={handleSubmitCode}
          />
        </AssessmentProvider>
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
    </>
  );
};

export default SecureAssessment;

