import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import adapter from "webrtc-adapter";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Phone,
  MessageSquare,
  Users,
  FileText,
  Link as LinkIcon,
  DollarSign,
  Play,
  ExternalLink,
  Settings,
  ArrowLeft,
  UserPlus,
  Copy,
  Check,
  X,
  Send,
  ChevronDown,
  Clock,
  MoreVertical,
  Maximize2,
  Minimize2,
  Smile,
  Hand,
  RefreshCw,
} from "lucide-react";
import Modal from "../Modal";
import { getSocket } from "../../utils/socketClient";
import { selectCurrentUser, selectToken } from "../../store/slices/authSlice";
import salesCallApi from "../../api/salesCall";
import {
  fetchSalesTeam,
  selectSalesTeam,
} from "../../store/slices/salesTeamSlice";

// ─── WebRTC STUN config with adapter support ────────────────────────
const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
};

// Log adapter info for debugging
console.log("WebRTC Adapter:", adapter.browserDetails);

// ─── Utility: format seconds to HH:MM:SS ───────────────────────────
const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

// ─── Utility: get initials from name ────────────────────────────────
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ─── Safe video play (avoid AbortError noise) ──────────────────────
const safePlay = async (el) => {
  if (!el) return;
  try {
    await el.play();
  } catch (err) {
    if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
      console.warn("Video play error:", err.name, err.message);
    }
  }
};

/* ════════════════════════════════════════════════════════════════════
   SALES CALL ROOM – Meeting-style layout
   ════════════════════════════════════════════════════════════════════ */
export default function SalesCallRoom({ callId, call }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const salesTeam = useSelector(selectSalesTeam);

  const role = user?.role;
  const isHost =
    role === "sales_executive" ||
    role === "sales_lead" ||
    role === "sales_admin" ||
    role === "sales_agent";

  const socket = useMemo(() => (token ? getSocket(token) : null), [token]);

  // ─── Core state ───────────────────────────────────────────────────
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sharedResources, setSharedResources] = useState([]);
  const [callStatus, setCallStatus] = useState(call?.status || "SCHEDULED");
  const [callDuration, setCallDuration] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);

  // ─── Media state ──────────────────────────────────────────────────
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const remoteStreamsRef = useRef({});
  const pcsRef = useRef(new Map());
  const screenStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isHost);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [mediaError, setMediaError] = useState(null);
  const [retryingMedia, setRetryingMedia] = useState(false);
  const [speakingParticipants, setSpeakingParticipants] = useState(new Set());
  const [screenShareParticipant, setScreenShareParticipant] = useState(null);

  // ─── UI state ─────────────────────────────────────────────────────
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("chat"); // chat | participants | tools | notes
  const [chatInput, setChatInput] = useState("");
  const [privateNotes, setPrivateNotes] = useState(call?.privateNotes || "");
  const [leadStatusUpdate, setLeadStatusUpdate] = useState(
    call?.leadStatusUpdate || null
  );

  // Sales tools links
  const [courseLink, setCourseLink] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [demoVideoLink, setDemoVideoLink] = useState("");

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // Timer ref
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);

  // ─── Auto-scroll chat ────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Fetch sales team for invite modal ────────────────────────────
  useEffect(() => {
    if (showInviteModal && salesTeam.length === 0) {
      dispatch(fetchSalesTeam());
    }
  }, [showInviteModal, salesTeam.length, dispatch]);

  // ─── Request media access (reusable function) ─────────────────────
  const requestMediaAccess = useCallback(async (requestVideo = true) => {
    // Check for mediaDevices support
    if (!navigator.mediaDevices) {
      // Fallback for older browsers
      if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        console.warn("Using legacy getUserMedia API");
      } else {
        console.error("Browser doesn't support media access");
        setMediaError("browser-not-supported");
        toast.error("Your browser doesn't support camera/microphone access. Please use a modern browser.");
        return null;
      }
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      console.error("getUserMedia not available");
      setMediaError("browser-not-supported");
      toast.error("Media access not available. Please check browser permissions.");
      return null;
    }

    try {
      setMediaError(null);
      let stream = null;
      let audioStream = null;
      let videoStream = null;

      // Try to get audio (required for communication)
      try {
        console.log("🎤 Requesting audio access...");
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Audio access granted");
      } catch (audioErr) {
        console.error("❌ Audio access failed:", audioErr);
        setMediaError("microphone");
        toast.error("Microphone access denied. Click 'Enable Media' to retry.", {
          duration: 6000,
        });
        // Continue - we'll still try video if requested
      }

      // Try to get video if requested
      if (requestVideo && isVideoOn) {
        try {
          console.log("📹 Requesting video access...");
          videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
          });
          console.log("✅ Video access granted");
        } catch (videoErr) {
          console.warn("⚠️ Video access failed:", videoErr);
          setIsVideoOn(false);
          // Don't throw - audio is more important
        }
      }

      // Combine streams if we have at least one
      if (audioStream || videoStream) {
        stream = new MediaStream();
        if (audioStream) {
          audioStream.getAudioTracks().forEach(track => stream.addTrack(track));
        }
        if (videoStream) {
          videoStream.getVideoTracks().forEach(track => stream.addTrack(track));
        }
        console.log("✅ Media stream created with", stream.getTracks().length, "tracks");
      }

      if (!stream || stream.getTracks().length === 0) {
        console.error("❌ No media tracks available");
        if (!audioStream && !videoStream) {
          setMediaError("no-devices");
          toast.error("No media devices available. Please check your camera/microphone.", {
            duration: 5000,
          });
        }
        return null;
      }
      
      return stream;
    } catch (err) {
      console.error("❌ Media request error:", err);
      setMediaError("unknown");
      toast.error("Failed to access media. Please check browser permissions.", {
        duration: 5000,
      });
      return null;
    }
  }, [isVideoOn]);

  // ─── Request local media ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const initMedia = async () => {
      console.log("🎬 Initializing media...");
      try {
        const stream = await requestMediaAccess(isVideoOn);
        
        if (cancelled) {
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
          }
          return;
        }
        
        if (!stream) {
          console.warn("⚠️ No stream available, but continuing...");
          // Don't return - allow joining without media, user can retry
          return;
        }
        
        console.log("✅ Setting local stream with", stream.getTracks().length, "tracks");
        localStreamRef.current = stream;

        // Apply initial mute state
        stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
        if (stream.getVideoTracks().length > 0) {
          stream.getVideoTracks().forEach((t) => (t.enabled = isVideoOn));
        }

        if (localVideoRef.current) {
          if (stream.getVideoTracks().length > 0) {
            localVideoRef.current.srcObject = stream;
            safePlay(localVideoRef.current);
          }
        }
        
        // Add tracks to existing peer connections
        setTimeout(() => {
          pcsRef.current.forEach((pc) => {
            stream.getTracks().forEach((track) => {
              const sender = pc.getSenders().find(s => s.track && s.track.kind === track.kind);
              if (sender) {
                sender.replaceTrack(track);
              } else {
                pc.addTrack(track, stream);
              }
            });
          });
        }, 100);
        
        if (stream.getAudioTracks().length > 0 && stream.getVideoTracks().length > 0) {
          toast.success("Camera and microphone connected");
        } else if (stream.getAudioTracks().length > 0) {
          toast.success("Microphone connected");
        }
        
        console.log("✅ Media initialization complete");
      } catch (err) {
        console.error("❌ Media initialization error:", err);
        // Error already handled in requestMediaAccess
      }
    };

    initMedia();

    return () => {
      cancelled = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      
      // Cleanup peer connections
      pcsRef.current.forEach((pc) => {
        pc.close();
      });
      pcsRef.current.clear();
      
      // Cleanup remote video refs
      Object.values(remoteVideoRefs.current).forEach((videoEl) => {
        if (videoEl && videoEl.srcObject) {
          videoEl.srcObject.getTracks().forEach((t) => t.stop());
        }
      });
      remoteVideoRefs.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Retry media access ────────────────────────────────────────────
  const handleRetryMedia = useCallback(async () => {
    setRetryingMedia(true);
    try {
      const stream = await requestMediaAccess(isVideoOn);
      
      if (!stream) {
        toast.error("Failed to access media. Please check browser permissions.", {
          duration: 5000,
        });
        return;
      }

      // Stop old stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      localStreamRef.current = stream;

      // Apply current mute state
      stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
      if (stream.getVideoTracks().length > 0) {
        stream.getVideoTracks().forEach((t) => (t.enabled = isVideoOn));
        setIsVideoOn(true);
      }

      if (localVideoRef.current) {
        if (stream.getVideoTracks().length > 0) {
          localVideoRef.current.srcObject = stream;
          safePlay(localVideoRef.current);
        }
      }
      
      // Update all peer connections
      pcsRef.current.forEach((pc) => {
        stream.getTracks().forEach((track) => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });
      });

      setMediaError(null);
      toast.success("Media access granted!");
    } catch (err) {
      console.error("Retry media error:", err);
      toast.error("Failed to access media. Please check browser settings.", {
        duration: 5000,
      });
    } finally {
      setRetryingMedia(false);
    }
  }, [isVideoOn, isMuted, requestMediaAccess]);

  // ─── Toggle mic ───────────────────────────────────────────────────
  const handleToggleMic = useCallback(() => {
    if (!localStreamRef.current) {
      toast.error("Microphone not available. Please enable media first.");
      return;
    }

    setIsMuted((prev) => {
      const next = !prev;
      
      // Update local audio tracks
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((t) => {
          t.enabled = !next;
          console.log(`🎤 Audio track ${t.id} ${!next ? 'enabled' : 'disabled'}`);
        });
      }
      
      // Update audio tracks in all peer connections
      pcsRef.current.forEach((pc, socketId) => {
        const senders = pc.getSenders();
        senders.forEach((sender) => {
          if (sender.track && sender.track.kind === 'audio') {
            sender.track.enabled = !next;
            console.log(`📡 Audio track updated for peer ${socketId}: ${!next ? 'enabled' : 'disabled'}`);
          }
        });
      });
      
      toast.success(next ? "Microphone muted" : "Microphone unmuted");
      return next;
    });
  }, []);

  // ─── Toggle video ─────────────────────────────────────────────────
  const handleToggleVideo = useCallback(async () => {
    // Don't allow toggling video if screen sharing
    if (isScreenSharing) {
      toast.error("Please stop screen sharing first");
      return;
    }

    const next = !isVideoOn;

    if (next) {
      // Turn on: get new video track
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error("Your browser doesn't support camera access");
          return;
        }

        console.log("📹 Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
        });
        
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
          throw new Error("No video track received");
        }

        // Ensure we have a local stream
        if (!localStreamRef.current) {
          localStreamRef.current = new MediaStream();
        }

        // Remove old video track if exists
        const oldVideoTracks = localStreamRef.current.getVideoTracks();
        oldVideoTracks.forEach((oldTrack) => {
          localStreamRef.current.removeTrack(oldTrack);
          oldTrack.stop();
        });

        // Add new video track
        localStreamRef.current.addTrack(videoTrack);
        console.log("✅ Video track added to local stream");
        
        // Update all peer connections with new video track
        pcsRef.current.forEach((pc, socketId) => {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          
          if (videoSender) {
            videoSender.replaceTrack(videoTrack).then(() => {
              console.log(`📡 Video track replaced for peer ${socketId}`);
            }).catch((err) => {
              console.error(`❌ Failed to replace video track for peer ${socketId}:`, err);
            });
          } else {
            // Add new video track if no sender exists
            try {
              pc.addTrack(videoTrack, localStreamRef.current);
              console.log(`📡 Video track added to peer ${socketId}`);
            } catch (err) {
              console.error(`❌ Failed to add video track to peer ${socketId}:`, err);
            }
          }
        });
        
        // Update local video display
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          safePlay(localVideoRef.current);
        }
        
        setIsVideoOn(true);
        toast.success("Camera enabled");
      } catch (err) {
        console.error("❌ Camera error:", err);
        let errorMessage = "Failed to access camera";
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = "Camera permission denied. Please allow camera access in browser settings.";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "No camera found. Please connect a camera device.";
        } else if (err.name === 'NotReadableError') {
          errorMessage = "Camera is being used by another application.";
        }
        
        toast.error(errorMessage);
        setIsVideoOn(false);
      }
    } else {
      // Turn off: disable video track (don't remove, just disable)
      const videoTracks = localStreamRef.current?.getVideoTracks() || [];
      videoTracks.forEach((t) => {
        t.enabled = false;
        console.log(`📹 Video track ${t.id} disabled`);
      });
      
      // Disable video in all peer connections (but keep the track)
      pcsRef.current.forEach((pc, socketId) => {
        const senders = pc.getSenders();
        senders.forEach((sender) => {
          if (sender.track && sender.track.kind === 'video') {
            sender.track.enabled = false;
            console.log(`📡 Video track disabled for peer ${socketId}`);
          }
        });
      });
      
      setIsVideoOn(false);
      toast.success("Camera disabled");
    }
  }, [isVideoOn, isScreenSharing]);

  // ─── Toggle screen share ─────────────────────────────────────────
  const handleToggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        console.log("🖥️ Starting screen share...");
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: true,
        });
        
        const screenVideoTrack = screen.getVideoTracks()[0];
        const screenAudioTrack = screen.getAudioTracks()[0];
        
        if (!screenVideoTrack) {
          throw new Error("No screen video track received");
        }

        // Store original camera track for restoration
        const originalVideoTrack = localStreamRef.current?.getVideoTracks().find(
          t => !t.label.toLowerCase().includes('screen')
        );

        screenStreamRef.current = screen;
        setIsScreenSharing(true);
        setScreenShareParticipant("local");

        console.log("✅ Screen share track obtained, updating", pcsRef.current.size, "peer connections...");
        
        // Replace video tracks in all peer connections with screen share
        pcsRef.current.forEach((pc, socketId) => {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          
          if (videoSender && screenVideoTrack) {
            videoSender.replaceTrack(screenVideoTrack).then(() => {
              console.log(`📡 Screen share track replaced for peer ${socketId}`);
            }).catch((err) => {
              console.error(`❌ Failed to replace screen share track for peer ${socketId}:`, err);
            });
          } else if (screenVideoTrack) {
            // Add screen share track if no video sender exists
            try {
              pc.addTrack(screenVideoTrack, screen);
              console.log(`📡 Screen share track added to peer ${socketId}`);
            } catch (err) {
              console.error(`❌ Failed to add screen share track to peer ${socketId}:`, err);
            }
          }
          
          // Handle screen audio if available
          if (screenAudioTrack) {
            const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
            if (audioSender) {
              audioSender.replaceTrack(screenAudioTrack).then(() => {
                console.log(`📡 Screen audio track replaced for peer ${socketId}`);
              }).catch((err) => {
                console.error(`❌ Failed to replace screen audio track for peer ${socketId}:`, err);
              });
            } else {
              try {
                pc.addTrack(screenAudioTrack, screen);
                console.log(`📡 Screen audio track added to peer ${socketId}`);
              } catch (err) {
                console.error(`❌ Failed to add screen audio track to peer ${socketId}:`, err);
              }
            }
          }
        });

        // Update local video to show screen share
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screen;
          safePlay(localVideoRef.current);
        }

        // Handle screen share end
        screenVideoTrack.onended = () => {
          console.log("🖥️ Screen share ended by user");
          setIsScreenSharing(false);
          setScreenShareParticipant(null);
          screenStreamRef.current = null;
          
          // Restore camera video track if it exists
          const originalVideoTrack = localStreamRef.current?.getVideoTracks().find(
            t => !t.label.toLowerCase().includes('screen')
          );
          
          if (originalVideoTrack && localStreamRef.current) {
            console.log("📹 Restoring camera video track...");
            pcsRef.current.forEach((pc, socketId) => {
              const senders = pc.getSenders();
              const videoSender = senders.find(s => s.track && s.track.kind === 'video');
              if (videoSender && originalVideoTrack) {
                videoSender.replaceTrack(originalVideoTrack).then(() => {
                  console.log(`📡 Camera track restored for peer ${socketId}`);
                }).catch((err) => {
                  console.error(`❌ Failed to restore camera track for peer ${socketId}:`, err);
                });
              }
            });
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
              safePlay(localVideoRef.current);
            }
          } else if (isVideoOn) {
            // Re-request camera if no original track
            console.log("📹 Re-requesting camera...");
            handleToggleVideo();
          }
        };
        
        toast.success("Screen sharing started");
      } catch (err) {
        console.error("❌ Screen share error:", err);
        if (err.name !== "NotAllowedError") {
          toast.error("Screen share failed: " + (err.message || "Unknown error"));
        }
        setIsScreenSharing(false);
        setScreenShareParticipant(null);
      }
    } else {
      console.log("🖥️ Stopping screen share...");
      // Stop screen share tracks
      screenStreamRef.current?.getTracks().forEach((t) => {
        t.stop();
        console.log(`🛑 Stopped screen track: ${t.kind}`);
      });
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      setScreenShareParticipant(null);
      
      // Restore camera video track if video was on
      if (localStreamRef.current && isVideoOn) {
        const cameraVideoTrack = localStreamRef.current.getVideoTracks().find(
          t => !t.label.toLowerCase().includes('screen')
        );
        
        if (cameraVideoTrack) {
          console.log("📹 Restoring camera video track...");
          pcsRef.current.forEach((pc, socketId) => {
            const senders = pc.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender && cameraVideoTrack) {
              videoSender.replaceTrack(cameraVideoTrack).then(() => {
                console.log(`📡 Camera track restored for peer ${socketId}`);
              }).catch((err) => {
                console.error(`❌ Failed to restore camera track for peer ${socketId}:`, err);
              });
            }
          });
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
            safePlay(localVideoRef.current);
          }
        } else {
          // Re-enable video if no camera track exists
          console.log("📹 Re-requesting camera...");
          handleToggleVideo();
        }
      }
      
      toast.success("Screen sharing stopped");
    }
  }, [isScreenSharing, isVideoOn, handleToggleVideo]);

  // ─── WebRTC: Create peer connection with adapter ──────────────────
  const createPeerConnection = useCallback((socketId, isInitiator = false) => {
    // Use adapter to handle browser differences
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcsRef.current.set(socketId, pc);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (track.kind === 'audio' || track.kind === 'video') {
          try {
            pc.addTrack(track, localStreamRef.current);
          } catch (err) {
            console.warn(`Failed to add ${track.kind} track:`, err);
          }
        }
      });
    }

    // Handle remote stream with adapter support
    pc.ontrack = (event) => {
      console.log('📹 Track received from', socketId, event.track.kind);
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setRemoteStreams((prev) => ({
          ...prev,
          [socketId]: remoteStream,
        }));
        
        // Detect screen share
        const videoTracks = remoteStream.getVideoTracks();
        if (videoTracks.length > 0 && videoTracks[0].label.toLowerCase().includes('screen')) {
          console.log('🖥️ Screen share detected from', socketId);
          setScreenShareParticipant(socketId);
        }
        
        // Detect speaking (audio level detection)
        const audioTracks = remoteStream.getAudioTracks();
        if (audioTracks.length > 0 && audioTracks[0].enabled) {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(remoteStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkSpeaking = () => {
              if (audioContext.state === 'closed') return;
              
              analyser.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              const isSpeaking = average > 30; // Threshold for speaking
              
              setSpeakingParticipants((prev) => {
                const next = new Set(prev);
                if (isSpeaking) {
                  next.add(socketId);
                } else {
                  next.delete(socketId);
                }
                return next;
              });
              
              requestAnimationFrame(checkSpeaking);
            };
            checkSpeaking();
          } catch (err) {
            console.warn('Audio analysis error:', err);
          }
        }
        
        // Create video element for remote stream
        if (!remoteVideoRefs.current[socketId]) {
          const videoEl = document.createElement('video');
          videoEl.autoplay = true;
          videoEl.playsInline = true;
          videoEl.srcObject = remoteStream;
          remoteVideoRefs.current[socketId] = videoEl;
          safePlay(videoEl);
        } else {
          remoteVideoRefs.current[socketId].srcObject = remoteStream;
          safePlay(remoteVideoRefs.current[socketId]);
        }
      }
    };

    // Handle ICE candidates with adapter
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        // Use adapter to normalize candidate
        const candidate = adapter.browserDetails.browser === 'safari' 
          ? event.candidate 
          : event.candidate.toJSON();
        
        socket.emit('webrtc:ice-candidate', {
          sessionId: callId,
          to: socketId,
          candidate: candidate,
        });
      } else if (!event.candidate) {
        console.log('ICE gathering complete for', socketId);
      }
    };

    // Handle connection state changes with adapter
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${socketId}:`, pc.connectionState);
      if (pc.connectionState === 'failed') {
        // Try to restart ICE (adapter handles browser differences)
        if (pc.restartIce) {
          pc.restartIce();
        } else {
          // Fallback: recreate connection
          setTimeout(() => {
            if (pcsRef.current.has(socketId)) {
              pcsRef.current.delete(socketId);
              createPeerConnection(socketId, isInitiator);
            }
          }, 1000);
        }
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${socketId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        // Restart ICE with adapter support
        if (pc.restartIce) {
          pc.restartIce();
        }
      }
    };

    return pc;
  }, [callId, socket]);

  // ─── WebRTC: Handle new participant ──────────────────────────────
  const handleNewParticipant = useCallback(async (participant) => {
    if (!socket || !localStreamRef.current) return;
    
    const participantSocketId = participant.socketId || participant.id;
    if (participantSocketId === 'local' || participantSocketId === socket.id) return;
    
    if (pcsRef.current.has(participantSocketId)) return; // Already connected

    const pc = createPeerConnection(participantSocketId, true);

    try {
      // Create offer with adapter support
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      // Apply adapter constraints for Safari
      if (adapter.browserDetails.browser === 'safari') {
        offer.sdp = offer.sdp.replace(/a=extmap-allow-mixed/g, '');
      }
      
      await pc.setLocalDescription(offer);

      // Send offer (use toJSON if available)
      socket.emit('webrtc:offer', {
        sessionId: callId,
        to: participantSocketId,
        offer: offer.toJSON ? offer.toJSON() : offer,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      toast.error('Failed to connect to participant');
    }
  }, [socket, callId, createPeerConnection]);

  // ─── WebRTC: Handle offer ────────────────────────────────────────
  const handleOffer = useCallback(async (data) => {
    if (!socket || !localStreamRef.current) return;
    
    const { from, offer } = data;
    let pc = pcsRef.current.get(from);
    
    if (!pc) {
      pc = createPeerConnection(from, false);
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      // Apply adapter constraints for Safari
      if (adapter.browserDetails.browser === 'safari') {
        answer.sdp = answer.sdp.replace(/a=extmap-allow-mixed/g, '');
      }
      
      await pc.setLocalDescription(answer);

      socket.emit('webrtc:answer', {
        sessionId: callId,
        to: from,
        answer: answer.toJSON ? answer.toJSON() : answer,
      });
    } catch (err) {
      console.error('Error handling offer:', err);
      toast.error('Failed to establish connection');
    }
  }, [socket, callId, createPeerConnection]);

  // ─── WebRTC: Handle answer ───────────────────────────────────────
  const handleAnswer = useCallback(async (data) => {
    const { from, answer } = data;
    const pc = pcsRef.current.get(from);
    
    if (pc && pc.signalingState !== 'stable') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  }, []);

  // ─── WebRTC: Handle ICE candidate with adapter ──────────────────
  const handleIceCandidate = useCallback(async (data) => {
    const { from, candidate } = data;
    const pc = pcsRef.current.get(from);
    
    if (pc && candidate) {
      try {
        // Use adapter to normalize candidate
        const iceCandidate = new RTCIceCandidate(candidate);
        await pc.addIceCandidate(iceCandidate);
      } catch (err) {
        // Ignore if candidate was already added (OperationError)
        if (err.name !== 'OperationError' && err.name !== 'InvalidStateError') {
          console.error('Error adding ICE candidate:', err);
        }
      }
    }
  }, []);

  // ─── Socket: join session ─────────────────────────────────────────
  useEffect(() => {
    if (!socket || !callId || hasJoined) return;

    const doJoin = () => {
      socket.emit("session:join", { sessionId: callId });
      setHasJoined(true);
    };

    socket.on("connect", doJoin);
    if (socket.connected) doJoin();

    return () => {
      socket.off("connect", doJoin);
    };
  }, [socket, callId, hasJoined]);

  // ─── Socket: event listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onParticipants = ({ participants: p }) => {
      console.log('📊 Participants received:', p);
      setParticipants(p || []);
      
      // Create peer connections for new participants
      if (p && p.length > 0) {
        // Wait for local stream to be ready
        const checkAndConnect = () => {
          if (localStreamRef.current) {
            console.log('✅ Local stream ready, creating peer connections');
            p.forEach((participant) => {
              const participantSocketId = participant.socketId || participant.id;
              if (participantSocketId !== 'local' && participantSocketId !== socket.id) {
                if (!pcsRef.current.has(participantSocketId)) {
                  console.log('🔗 Creating peer connection for:', participantSocketId);
                  handleNewParticipant(participant);
                }
              }
            });
          } else {
            console.warn('⚠️ Local stream not ready yet, will retry in 500ms...');
            // Retry after a short delay (max 5 seconds)
            const maxRetries = 10;
            let retries = 0;
            const retryInterval = setInterval(() => {
              retries++;
              if (localStreamRef.current || retries >= maxRetries) {
                clearInterval(retryInterval);
                if (localStreamRef.current) {
                  checkAndConnect();
                } else {
                  console.error('❌ Local stream not available after retries');
                }
              }
            }, 500);
          }
        };
        
        checkAndConnect();
      }
    };

    const onChatMessage = (msg) =>
      setMessages((prev) => [...prev, msg]);

    const onResourceShared = ({ resource }) => {
      setSharedResources((prev) => [...prev, resource]);
      toast.success("Resource shared");
    };

    const onLeadStatusUpdated = ({ leadStatusUpdate: status }) => {
      setLeadStatusUpdate(status);
      toast.success("Lead status updated");
    };

    const onCallEnded = () => {
      setCallStatus("COMPLETED");
      toast.success("Call ended");
    };

    const onError = ({ error }) => toast.error(error || "An error occurred");

    // WebRTC signaling events
    const onWebRTCOffer = (data) => handleOffer(data);
    const onWebRTCAnswer = (data) => handleAnswer(data);
    const onWebRTCIceCandidate = (data) => handleIceCandidate(data);

    socket.on("session:participants", onParticipants);
    socket.on("chat:message", onChatMessage);
    socket.on("sales:call:resource-shared", onResourceShared);
    socket.on("sales:call:lead-status-updated", onLeadStatusUpdated);
    socket.on("sales:call:ended", onCallEnded);
    socket.on("session:error", onError);
    socket.on("webrtc:offer", onWebRTCOffer);
    socket.on("webrtc:answer", onWebRTCAnswer);
    socket.on("webrtc:ice-candidate", onWebRTCIceCandidate);

    return () => {
      socket.off("session:participants", onParticipants);
      socket.off("chat:message", onChatMessage);
      socket.off("sales:call:resource-shared", onResourceShared);
      socket.off("sales:call:lead-status-updated", onLeadStatusUpdated);
      socket.off("sales:call:ended", onCallEnded);
      socket.off("session:error", onError);
      socket.off("webrtc:offer", onWebRTCOffer);
      socket.off("webrtc:answer", onWebRTCAnswer);
      socket.off("webrtc:ice-candidate", onWebRTCIceCandidate);
    };
  }, [socket, handleNewParticipant, handleOffer, handleAnswer, handleIceCandidate]);

  // ─── Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (callStatus === "ONGOING") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // ─── API: Start call ─────────────────────────────────────────────
  const handleStartCall = async () => {
    try {
      await salesCallApi.startCall(callId);
      setCallStatus("ONGOING");
      toast.success("Call started");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start call");
    }
  };

  // ─── API: End call ────────────────────────────────────────────────
  const handleEndCall = async () => {
    try {
      const insights = {
        engagementLevel: "MEDIUM",
        chatTranscript: messages,
        sharedResources,
      };
      await salesCallApi.endCall(callId, insights, leadStatusUpdate);
      setCallStatus("COMPLETED");
      toast.success("Call ended and saved to CRM");
      navigate("/sales/calls");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to end call");
    }
  };

  // ─── Socket: share resource ───────────────────────────────────────
  const handleShareResource = (type, url, title) => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    socket.emit("sales:call:share-resource", {
      sessionId: callId,
      resource: { type, url, title },
    });
  };

  // ─── API: update lead status ──────────────────────────────────────
  const handleUpdateLeadStatus = async (status) => {
    try {
      await salesCallApi.updateLeadStatus(callId, status);
      setLeadStatusUpdate(status);
      socket.emit("sales:call:update-lead-status", {
        sessionId: callId,
        leadStatusUpdate: status,
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update lead status"
      );
    }
  };

  // ─── API: save private notes ──────────────────────────────────────
  const handleSaveNotes = async () => {
    try {
      await salesCallApi.updateCall(callId, { privateNotes });
      socket.emit("sales:call:save-notes", {
        sessionId: callId,
        notes: privateNotes,
      });
      toast.success("Notes saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save notes");
    }
  };

  // ─── Socket: send chat message ────────────────────────────────────
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit("chat:send", {
      sessionId: callId,
      message: chatInput,
      to: "everyone",
    });
    setChatInput("");
  };

  // ─── Invite members ──────────────────────────────────────────────
  const handleInviteMembers = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    try {
      setInviteLoading(true);
      await salesCallApi.inviteMembers(callId, selectedUserIds);
      toast.success("Members invited successfully");
      setShowInviteModal(false);
      setSelectedUserIds([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to invite");
    } finally {
      setInviteLoading(false);
    }
  };

  // ─── Copy invite link ────────────────────────────────────────────
  const handleCopyInviteLink = () => {
    const base = window.location.origin;
    const link =
      call?.meetingLink ||
      `${base}/sales/calls/join/${call?.secureAccessToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setInviteLinkCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setInviteLinkCopied(false), 2000);
    });
  };

  // ─── Toggle sidebar tab ──────────────────────────────────────────
  const openSidebarTab = (tab) => {
    if (showSidebar && sidebarTab === tab) {
      setShowSidebar(false);
    } else {
      setSidebarTab(tab);
      setShowSidebar(true);
    }
  };

  // ─── Auto-layout: Sort participants by priority ────────────────────
  // Priority: 1. Screen share, 2. Speaking, 3. Others
  const sortedParticipants = useMemo(() => {
    const self = {
      socketId: "local",
      id: user?.userId || user?.id || "local",
      name: user?.name || "You",
      role: role,
      isLocal: true,
    };
    
    const all = [self, ...participants.filter((p) => p.id !== self.id)];
    
    return all.sort((a, b) => {
      const aId = a.socketId || a.id;
      const bId = b.socketId || b.id;
      
      // Screen share has highest priority
      const aIsScreenShare = (a.isLocal && isScreenSharing) || screenShareParticipant === aId;
      const bIsScreenShare = (b.isLocal && isScreenSharing) || screenShareParticipant === bId;
      if (aIsScreenShare && !bIsScreenShare) return -1;
      if (!aIsScreenShare && bIsScreenShare) return 1;
      
      // Speaking has second priority
      const aIsSpeaking = a.isLocal ? !isMuted : speakingParticipants.has(aId);
      const bIsSpeaking = b.isLocal ? !isMuted : speakingParticipants.has(bId);
      if (aIsSpeaking && !bIsSpeaking) return -1;
      if (!aIsSpeaking && bIsSpeaking) return 1;
      
      return 0;
    });
  }, [participants, user, role, isScreenSharing, screenShareParticipant, speakingParticipants, isMuted]);

  // ─── Video grid layout helper (auto-adjusts) ──────────────────────
  const getGridClass = (count) => {
    // If screen share exists, use special layout
    if (screenShareParticipant || (isScreenSharing && sortedParticipants.length > 1)) {
      return "grid-cols-1"; // Screen share takes full width
    }
    
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  // Build "all participants" including self (sorted by priority)
  const allParticipants = sortedParticipants;

  // ─── Leave meeting (cleanup) ─────────────────────────────────────
  const handleLeaveMeeting = () => {
    if (socket) {
      socket.emit("session:leave", { sessionId: callId });
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    navigate("/sales/meetings-counselling");
  };

  // ════════════════════  RENDER  ════════════════════════════════════
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1a1a2e] text-white select-none">
      {/* ═══════ TOP BAR ═══════ */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#16213e] px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeaveMeeting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold leading-tight text-white/90">
              {call?.leadName || "Sales Call"}
            </h1>
            <p className="text-[11px] text-white/40">
              {call?.leadId
                ? `Lead: ${String(call.leadId).slice(-6)}`
                : "Video Call"}
            </p>
          </div>
        </div>

        {/* Center – status pill */}
        <div className="flex items-center gap-2">
          {callStatus === "ONGOING" && (
            <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-semibold tabular-nums text-white/80">
                {formatDuration(callDuration)}
              </span>
            </div>
          )}
          {callStatus === "SCHEDULED" && (
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
              Scheduled
            </span>
          )}
          {callStatus === "COMPLETED" && (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
              Completed
            </span>
          )}
          {leadStatusUpdate && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                leadStatusUpdate === "CONVERTED"
                  ? "bg-green-500/20 text-green-400"
                  : leadStatusUpdate === "INTERESTED"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {leadStatusUpdate.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Invite</span>
            </button>
          )}
          {callStatus === "SCHEDULED" && isHost && (
            <button
              onClick={handleStartCall}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
            >
              <Play className="h-3.5 w-3.5" />
              Start
            </button>
          )}
          <button
            onClick={handleCopyInviteLink}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
            title="Copy invite link"
          >
            {inviteLinkCopied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* ═══════ MAIN BODY (video + sidebar) ═══════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── VIDEO STAGE ─── */}
        <div className="relative flex flex-1 flex-col">
          {/* Video Grid */}
          <div className="flex-1 overflow-hidden p-2 sm:p-4">
            <div
              className={`grid ${getGridClass(
                allParticipants.length
              )} h-full w-full gap-2 sm:gap-3`}
            >
              {allParticipants.map((participant) => {
                const isLocal =
                  participant.isLocal || participant.socketId === "local";
                const participantSocketId = participant.socketId || participant.id;
                const pName = isLocal
                  ? "You"
                  : participant.name || "Participant";
                const initials = getInitials(
                  isLocal ? user?.name || "You" : participant.name
                );
                const hasVideo = isLocal ? isVideoOn : !!remoteStreams[participantSocketId];
                const hasMic = isLocal ? !isMuted : true;
                const isScreenShare =
                  isLocal && isScreenSharing;
                const remoteStream = remoteStreams[participantSocketId];

                return (
                  <div
                    key={participantSocketId}
                    className="relative flex items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f3460] transition-all hover:border-blue-500/40"
                    style={{
                      minHeight: allParticipants.length <= 2 ? "300px" : "180px",
                    }}
                  >
                    {/* Video or Avatar */}
                    {hasVideo ? (
            <video
                        ref={isLocal ? localVideoRef : (el) => {
                          if (el && remoteStream && !isLocal) {
                            el.srcObject = remoteStream;
                            safePlay(el);
                          }
                        }}
              autoPlay
              playsInline
                        muted={isLocal}
                        className="h-full w-full object-cover"
                        style={{
                          transform: isLocal && !isScreenShare
                            ? "scaleX(-1)"
                            : "none",
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-24 sm:w-24">
                          <span className="text-2xl font-bold text-white sm:text-3xl">
                            {initials}
                          </span>
                        </div>
                      </div>
          )}

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-2 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-medium text-white sm:text-sm">
                            {pName}
                          </span>
                          {participant.role &&
                            (participant.role.includes("sales") ||
                              participant.role === "admin") && (
                              <span className="rounded bg-blue-600 px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                                Host
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!hasMic && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/90">
                              <MicOff className="h-3 w-3 text-white" />
            </div>
          )}
                          {!hasVideo && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-600/80">
                              <VideoOff className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── CONTROL BAR ─── */}
          <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#16213e]">
            <div className="flex h-[68px] items-center justify-between px-3 sm:px-6">
              {/* Left: Timer (desktop) */}
              <div className="hidden min-w-[120px] sm:flex items-center gap-2">
                {callStatus === "ONGOING" && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="text-xs font-semibold tabular-nums text-white/80">
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                )}
                <span className="text-[11px] text-white/30">
                  {allParticipants.length} participant
                  {allParticipants.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Center: Media Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Retry Media Access Button (if error) */}
                {mediaError && (
                  <button
                    onClick={handleRetryMedia}
                    disabled={retryingMedia}
                    className="flex items-center gap-2 rounded-full bg-yellow-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-yellow-700 disabled:opacity-50 sm:px-5"
                    title="Retry media access"
                  >
                    {retryingMedia ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Retrying...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {mediaError === 'microphone' ? 'Enable Microphone' : 'Enable Media'}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {/* Mic */}
                <button
              onClick={handleToggleMic}
                  disabled={!localStreamRef.current?.getAudioTracks().length && !mediaError}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
                    !localStreamRef.current?.getAudioTracks().length && !mediaError
                      ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                      : isMuted
                      ? "bg-red-600 hover:bg-red-700"
                      : "border border-white/10 bg-white/[0.08] hover:bg-white/[0.15]"
                  }`}
                  title={
                    !localStreamRef.current?.getAudioTracks().length && !mediaError
                      ? "Microphone not available"
                      : isMuted
                      ? "Unmute"
                      : "Mute"
                  }
                >
                  {isMuted || (!localStreamRef.current?.getAudioTracks().length && !mediaError) ? (
                    <MicOff className="h-5 w-5 text-white" />
                  ) : (
                    <Mic className="h-5 w-5 text-white" />
                  )}
                </button>

                {/* Camera */}
                <button
                  onClick={handleToggleVideo}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
                    !isVideoOn
                      ? "bg-red-600 hover:bg-red-700"
                      : "border border-white/10 bg-white/[0.08] hover:bg-white/[0.15]"
                  }`}
                  title={isVideoOn ? "Turn off video" : "Turn on video"}
                >
                  {isVideoOn ? (
                    <Video className="h-5 w-5 text-white" />
                  ) : (
                    <VideoOff className="h-5 w-5 text-white" />
                  )}
                </button>

                {/* Screen share */}
            {isHost && (
                  <button
                    onClick={handleToggleScreenShare}
                    className={`hidden sm:flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
                      isScreenSharing
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border border-white/10 bg-white/[0.08] hover:bg-white/[0.15]"
                    }`}
                    title="Share screen"
                  >
                    <Monitor className="h-5 w-5 text-white" />
                  </button>
                )}

                {/* Separator */}
                <div className="mx-1 hidden h-7 w-px bg-white/10 sm:block" />

                {/* Participants */}
                <button
                  onClick={() => openSidebarTab("participants")}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
                    showSidebar && sidebarTab === "participants"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border border-white/10 bg-white/[0.08] hover:bg-white/[0.15]"
                  }`}
                  title="Participants"
                >
                  <Users className="h-5 w-5 text-white" />
                  {participants.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#16213e] bg-blue-600 px-0.5 text-[10px] font-bold text-white">
                      {participants.length}
                    </span>
                  )}
                </button>

                {/* Chat */}
                <button
                  onClick={() => openSidebarTab("chat")}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
                    showSidebar && sidebarTab === "chat"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border border-white/10 bg-white/[0.08] hover:bg-white/[0.15]"
                  }`}
                  title="Chat"
              >
                  <MessageSquare className="h-5 w-5 text-white" />
                  {messages.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#16213e] bg-blue-600 px-0.5 text-[10px] font-bold text-white">
                      {messages.length > 99 ? "99+" : messages.length}
                    </span>
            )}
                </button>

                {/* Sales Tools */}
            {isHost && (
                  <button
                    onClick={() => openSidebarTab("tools")}
                    className={`hidden sm:flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
                      showSidebar && sidebarTab === "tools"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border border-white/10 bg-white/[0.08] hover:bg-white/[0.15]"
                    }`}
                    title="Sales Tools"
                  >
                    <Settings className="h-5 w-5 text-white" />
                  </button>
                )}

                {/* Notes */}
                {isHost && (
                  <button
                    onClick={() => openSidebarTab("notes")}
                    className={`hidden sm:flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
                      showSidebar && sidebarTab === "notes"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "border border-white/10 bg-white/[0.08] hover:bg-white/[0.15]"
                    }`}
                    title="Private Notes"
                  >
                    <FileText className="h-5 w-5 text-white" />
                  </button>
                )}

                {/* Separator */}
                <div className="mx-1 h-7 w-px bg-white/10" />

                {/* End call */}
                {callStatus === "ONGOING" && isHost ? (
                  <button
                    onClick={handleEndCall}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 transition-all hover:bg-red-700 sm:h-12 sm:w-12"
                    title="End call"
                  >
                    <Phone className="h-5 w-5 rotate-[135deg] text-white" />
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveMeeting}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 transition-all hover:bg-red-700 sm:h-12 sm:w-12"
                    title="Leave meeting"
              >
                    <Phone className="h-5 w-5 rotate-[135deg] text-white" />
                  </button>
                )}
              </div>

              {/* Right: spacer + mobile timer */}
              <div className="flex min-w-[120px] items-center justify-end sm:hidden">
                {callStatus === "ONGOING" && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="text-xs font-semibold tabular-nums text-white/80">
                      {formatDuration(callDuration)}
                    </span>
                  </div>
            )}
              </div>
              {/* Desktop spacer */}
              <div className="hidden min-w-[120px] sm:block" />
            </div>
          </div>
        </div>

        {/* ═══════ SIDEBAR ═══════ */}
        {showSidebar && (
          <div className="flex w-80 flex-shrink-0 flex-col border-l border-white/[0.06] bg-[#16213e] lg:w-96">
            {/* Sidebar Header */}
            <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-4">
              <h3 className="text-sm font-semibold capitalize text-white/90">
                {sidebarTab === "tools" ? "Sales Tools" : sidebarTab}
              </h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex border-b border-white/[0.06]">
              {["chat", "participants", ...(isHost ? ["tools", "notes"] : [])].map(
                (tab) => (
              <button
                    key={tab}
                    onClick={() => setSidebarTab(tab)}
                    className={`flex-1 py-2 text-[11px] font-medium uppercase tracking-wider transition ${
                      sidebarTab === tab
                        ? "border-b-2 border-blue-500 text-blue-400"
                        : "text-white/40 hover:text-white/70"
                }`}
              >
                    {tab === "tools" ? "Tools" : tab}
              </button>
                )
              )}
            </div>

            {/* Sidebar Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* ── CHAT ── */}
              {sidebarTab === "chat" && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-white/30">
                        <MessageSquare className="mb-2 h-8 w-8" />
                        <p className="text-xs">No messages yet</p>
                      </div>
                    )}
                    {messages.map((msg, idx) => {
                      const isMe =
                        msg.user?.id === (user?.userId || user?.id);
                      return (
                        <div
                          key={idx}
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 ${
                              isMe
                                ? "bg-blue-600 text-white"
                                : "bg-white/[0.06] text-white/90"
                            }`}
                          >
                            {!isMe && (
                              <p className="mb-0.5 text-[10px] font-semibold text-blue-400">
                                {msg.user?.name || "User"}
                              </p>
                            )}
                            <p className="text-xs leading-relaxed">
                              {msg.message}
                            </p>
                            <p
                              className={`mt-1 text-[9px] ${
                                isMe ? "text-white/50" : "text-white/30"
                              }`}
                            >
                              {new Date(msg.ts).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input */}
                  <div className="border-t border-white/[0.06] p-3">
                    <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-1.5">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Type a message…"
                        className="flex-1 border-0 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-30"
                      >
                        <Send className="h-4 w-4" />
              </button>
            </div>
                  </div>
                </div>
              )}

              {/* ── PARTICIPANTS ── */}
              {sidebarTab === "participants" && (
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      {allParticipants.length} in call
                    </span>
                    {isHost && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-1 rounded-md bg-blue-600/20 px-2 py-1 text-[10px] font-medium text-blue-400 transition hover:bg-blue-600/30"
                      >
                        <UserPlus className="h-3 w-3" />
                        Invite
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {allParticipants.map((p) => {
                      const isLocal =
                        p.isLocal || p.socketId === "local";
                      const pName = isLocal ? "You" : p.name || "Participant";
                      return (
                        <div
                          key={p.socketId || p.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/[0.04]"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                            {getInitials(isLocal ? user?.name : p.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-white/90">
                              {pName}
                              {isLocal && (
                                <span className="ml-1 text-[10px] text-white/40">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] capitalize text-white/40">
                              {(p.role || "participant").replace("_", " ")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {p.handRaised && (
                              <Hand className="h-4 w-4 text-yellow-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── SALES TOOLS ── */}
              {sidebarTab === "tools" && isHost && (
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {/* Lead Status */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      Lead Status
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["INTERESTED", "FOLLOW_UP", "CONVERTED"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateLeadStatus(s)}
                          className={`rounded-lg py-2 text-[10px] font-semibold uppercase transition ${
                            leadStatusUpdate === s
                              ? s === "CONVERTED"
                                ? "bg-green-600 text-white"
                                : s === "INTERESTED"
                                ? "bg-blue-600 text-white"
                                : "bg-yellow-600 text-white"
                              : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                          }`}
                        >
                          {s.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Share Course Link */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      Share Course Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={courseLink}
                        onChange={(e) => setCourseLink(e.target.value)}
                        placeholder="https://…"
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-blue-500/50"
                      />
                      <button
                        onClick={() =>
                          handleShareResource("course", courseLink, "Course")
                        }
                        className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Share Payment Link */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      Share Payment Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paymentLink}
                        onChange={(e) => setPaymentLink(e.target.value)}
                        placeholder="https://…"
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-green-500/50"
                      />
                      <button
                        onClick={() =>
                          handleShareResource("payment", paymentLink, "Payment")
                        }
                        className="flex-shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                      >
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Share Demo Video */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      Share Demo Video
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={demoVideoLink}
                        onChange={(e) => setDemoVideoLink(e.target.value)}
                        placeholder="https://…"
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-purple-500/50"
                      />
                      <button
                        onClick={() =>
                          handleShareResource("video", demoVideoLink, "Demo")
                        }
                        className="flex-shrink-0 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-purple-700"
                      >
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Shared Resources */}
                  {sharedResources.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/50">
                        Shared Resources
                      </label>
                      <div className="space-y-1.5">
                        {sharedResources.map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.08]"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-white/80">
                                {r.title || r.type}
                              </p>
                              <p className="truncate text-[10px] text-blue-400">
                                {r.url}
                              </p>
                            </div>
                            <ExternalLink className="ml-2 h-3.5 w-3.5 flex-shrink-0 text-white/30" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PRIVATE NOTES ── */}
              {sidebarTab === "notes" && isHost && (
                <div className="flex flex-1 flex-col p-4">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Private Notes
                  </label>
                  <p className="mb-3 text-[10px] text-white/30">
                    Only visible to you — saved to CRM
                  </p>
                  <textarea
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    placeholder="Type your private notes here…"
                    className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/50"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="mt-3 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-700"
                  >
                    Save Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════ INVITE MEMBERS MODAL ═══════ */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedUserIds([]);
        }}
        title="Invite Members to Call"
        size="md"
      >
        <div className="space-y-4">
          {/* Invite link */}
          <div className="rounded-xl bg-gray-50 p-4">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Invite Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={
                  call?.meetingLink ||
                  `${window.location.origin}/sales/calls/join/${call?.secureAccessToken}`
                }
                readOnly
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600"
              />
              <button
                onClick={handleCopyInviteLink}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {inviteLinkCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Team members */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Select Team Members
            </label>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
              {salesTeam.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  Loading team…
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {salesTeam
                    .filter(
                      (m) =>
                        m.id !== user?.userId && m.id !== user?.id
                    )
                    .map((member) => (
                      <label
                        key={member.id}
                        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds([
                                ...selectedUserIds,
                                member.id,
                              ]);
                            } else {
                              setSelectedUserIds(
                                selectedUserIds.filter(
                                  (id) => id !== member.id
                                )
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                          {getInitials(member.name || member.fullName)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {member.name || member.fullName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {member.email}
                          </p>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={() => {
                setShowInviteModal(false);
                setSelectedUserIds([]);
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteMembers}
              disabled={selectedUserIds.length === 0 || inviteLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
            >
              {inviteLoading
                ? "Inviting…"
                : `Invite ${selectedUserIds.length} Member${
                    selectedUserIds.length !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
