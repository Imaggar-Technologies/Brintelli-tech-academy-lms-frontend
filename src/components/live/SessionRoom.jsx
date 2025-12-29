import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  MessageSquare,
  Users,
  Link as LinkIcon,
  BarChart3,
  Monitor,
  StopCircle,
  Play,
  ExternalLink,
  Video,
  Camera,
  Mic,
  MicOff,
  Hand,
} from "lucide-react";
import PageHeader from "../PageHeader";
import Button from "../Button";
import { getSocket } from "../../utils/socketClient";
import { selectCurrentUser, selectToken } from "../../store/slices/authSlice";
import tutorAPI from "../../api/tutor";

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function SessionRoom({ sessionId, session, uiVariant = "classic" }) {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);

  const role = user?.role;
  const isTutor = role === "tutor";
  const canModerate = ["tutor", "admin", "programManager", "program-manager"].includes(role);

  const socket = useMemo(() => (token ? getSocket(token) : null), [token]);

  const [participants, setParticipants] = useState([]);
  const [participantMediaPerms, setParticipantMediaPerms] = useState({}); // { userId: { camAllowed, micAllowed } }
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [polls, setPolls] = useState([]);
  const [sessionRecordings, setSessionRecordings] = useState([]);
  const [mentionAlerts, setMentionAlerts] = useState(0);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [pollPopupOpen, setPollPopupOpen] = useState(false);
  const [activePoll, setActivePoll] = useState(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const pollDialogTitleId = useMemo(() => `poll_dialog_title_${sessionId}`, [sessionId]);
  const firstPollOptionRef = useRef(null);
  const [chatTo, setChatTo] = useState("everyone"); // "everyone" | "tutors"

  // Student mic/cam gating (tutor grants)
  const [myMediaPerms, setMyMediaPerms] = useState({ micAllowed: false, camAllowed: false, micRequested: false, camRequested: false });
  const [incomingMediaRequests, setIncomingMediaRequests] = useState([]); // tutor view: [{from, kind, ts}]
  const studentStreamRef = useRef(null);
  const [studentCamOn, setStudentCamOn] = useState(false);
  const [studentMicOn, setStudentMicOn] = useState(false);
  const uplinkPcRef = useRef(null); // student -> tutor
  const [tutorUplinks, setTutorUplinks] = useState([]); // tutor view: [{ socketId, user, stream }]
  const chatScrollRef = useRef(null);
  const chatBottomRef = useRef(null);
  const chatStickToBottomRef = useRef(true);
  const [chatStickToBottom, setChatStickToBottom] = useState(true);

  const [chatInput, setChatInput] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollCorrectAnswer, setPollCorrectAnswer] = useState(null); // index of correct answer
  const [pollDraft, setPollDraft] = useState(null); // draft poll before publishing
  const [leaderboard, setLeaderboard] = useState([]); // [{userId, name, score}]
  const [showLeftSidebar, setShowLeftSidebar] = useState(true); // for tutors
  const [leftSidebarTab, setLeftSidebarTab] = useState("students"); // "students" | "polls" | "leaderboard"

  const [recordingUrl, setRecordingUrl] = useState("");
  const [savingRecording, setSavingRecording] = useState(false);
  const [recordingUrlLocal, setRecordingUrlLocal] = useState("");

  // WebRTC (screen + camera)
  const screenPreviewRef = useRef(null);
  const cameraPreviewRef = useRef(null);
  const remoteScreenRef = useRef(null);
  const remoteCameraRef = useRef(null);
  const screenStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  // When tutor screen-shares without camera, we attach a mic track to the screen stream so students can hear.
  const screenMicStreamRef = useRef(null);
  const screenMicTrackRef = useRef(null);
  const pcsRef = useRef(new Map()); // socketId -> RTCPeerConnection
  const [broadcastMode, setBroadcastMode] = useState(null); // legacy indicator: "camera" | "screen" | null
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [streamMeta, setStreamMeta] = useState({ screenStreamId: null, cameraStreamId: null });
  const streamMetaRef = useRef({ screenStreamId: null, cameraStreamId: null });
  const [hasRemoteCamera, setHasRemoteCamera] = useState(false);
  const [hasRemoteScreen, setHasRemoteScreen] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(session?.status || "SCHEDULED");
  const [isRecording, setIsRecording] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [preJoinCamOn, setPreJoinCamOn] = useState(false);
  const [preJoinMicOn, setPreJoinMicOn] = useState(false);
  const preJoinStreamRef = useRef(null);
  const preJoinVideoRef = useRef(null);
  
  // Notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTQ8OUKjj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknU0PDlCo4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      // Ignore
    }
  };
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingAnimRef = useRef(null);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [showResourceComposer, setShowResourceComposer] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrolledBatch, setEnrolledBatch] = useState(null);

  // Mentions (@) support
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  const mentionCandidates = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    const list = (participants || []).filter((p) => p?.name);
    if (!q) return list.slice(0, 8);
    return list.filter((p) => String(p.name).toLowerCase().includes(q)).slice(0, 8);
  }, [participants, mentionQuery]);

  const renderMessageWithHighlights = (text) => {
    const raw = String(text || "");
    if (!raw) return null;
    if (!raw.includes("@")) return raw;

    const names = (participants || [])
      .map((p) => String(p?.name || "").trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    if (names.length === 0) return raw;

    const tokens = raw.split(/(\s+)/);
    return tokens.map((tok, idx) => {
      const t = String(tok);
      if (!t.startsWith("@")) return <span key={idx}>{t}</span>;

      // Strip trailing punctuation for matching, but keep it visually
      const afterAtRaw = t.slice(1);
      const stripped = afterAtRaw.replace(/[),.;:!?\]]+$/g, "");
      const suffix = afterAtRaw.slice(stripped.length);
      const matched = names.find((n) => n.toLowerCase() === stripped.toLowerCase());
      if (!matched) return <span key={idx}>{t}</span>;

      return (
        <mark
          key={idx}
          className="rounded-md bg-amber-100 px-1 py-0.5 font-semibold text-amber-900 ring-1 ring-amber-200/60"
        >
          @{matched}{suffix}
        </mark>
      );
    });
  };

  const onChatScroll = (e) => {
    const el = e?.currentTarget;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    chatStickToBottomRef.current = atBottom;
    setChatStickToBottom(atBottom);
    if (atBottom) setMentionAlerts(0);
  };

  useEffect(() => {
    if (!chatStickToBottomRef.current) return;
    chatBottomRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // Better accessibility for poll popup (focus + escape)
  useEffect(() => {
    if (!pollPopupOpen) return;
    const t = setTimeout(() => firstPollOptionRef.current?.focus?.(), 0);
    const onKey = (e) => {
      if (e.key === "Escape") setPollPopupOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [pollPopupOpen]);

  const formatChatTime = (ts) => {
    try {
      return ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    } catch {
      return "";
    }
  };

  const normalizeMessage = (m) => {
    if (!m) return { type: "comment", message: "" };
    const msg = String(m.message || "");
    const t = m.type || "comment";
    if (t !== "comment") return { ...m, type: t };
    if (msg.startsWith("[RESOURCE]")) return { ...m, type: "resource" };
    if (msg.startsWith("[POLL RESULT]")) return { ...m, type: "poll-results" };
    if (msg.startsWith("[POLL ANSWER]")) return { ...m, type: "poll-answer" };
    if (msg.startsWith("[POLL]")) return { ...m, type: "poll" };
    return { ...m, type: "comment" };
  };

  const ChatCard = ({ icon, title, meta, children, accent = "border-white/10" }) => (
    <div className={`rounded-xl border ${accent} bg-white/5 p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="text-white/80">{icon}</div>
          <div className="text-sm font-semibold text-white/90">{title}</div>
        </div>
        {meta ? <div className="text-xs font-semibold text-white/50">{meta}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );

  const renderChatMessage = (rawMsg, { variant = "meeting" } = {}) => {
    const m = normalizeMessage(rawMsg);
    const name = m.user?.name || "User";
    const roleLabel = m.user?.role ? `(${m.user.role})` : "";
    const time = formatChatTime(m.ts);
    const isSystem = String(m.user?.role || "").toLowerCase() === "system" || name === "System";
    const myId = String(user?.id || user?._id || "");
    const fromMe = !!myId && String(m.user?.id || m.user?._id || "") === myId;
    const toLabel = String(m.to || "everyone").toLowerCase() === "tutors" ? "To: Tutors" : "To: Everyone";

    const baseTextColor = variant === "meeting" ? "text-white/90" : "text-textSoft";
    const mutedTextColor = variant === "meeting" ? "text-white/50" : "text-textMuted";
    const cardBg = variant === "meeting" ? "" : "bg-white";
    const cardBorder = variant === "meeting" ? "border-white/10 bg-white/5" : "border-brintelli-border bg-white";

    if (m.type === "resource") {
      const r = m.resource || null;
      const title = r?.title || (m.message || "").replace("[RESOURCE]", "").trim() || "Resource";
      const url = r?.url || "";
      return (
        <div className="space-y-1">
          <div className={`text-xs ${mutedTextColor}`}>
            <span className={isSystem ? "font-semibold" : "font-semibold"}>{name}</span> {roleLabel} {time ? `• ${time}` : ""}
          </div>
          <div className={`rounded-xl border ${cardBorder} p-3`}>
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-2 text-sm font-semibold ${variant === "meeting" ? "text-white/90" : "text-text"}`}>
                <LinkIcon className="h-4 w-4" />
                Resource
              </div>
              {url ? (
                <Button variant="secondary" onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>
                  Open
                </Button>
              ) : null}
            </div>
            <div className={`mt-2 text-sm ${baseTextColor}`}>{title}</div>
            {url ? <div className={`mt-1 text-xs ${mutedTextColor}`}>{url}</div> : null}
          </div>
        </div>
      );
    }

    if (m.type === "poll") {
      const p = polls.find((x) => x?.id === m.pollId) || m.poll || null;
      const question = p?.question || (m.message || "").replace("[POLL]", "").trim() || "Poll";
      return (
        <div className="space-y-1">
          <div className={`text-xs ${mutedTextColor}`}>
            <span className="font-semibold">{name}</span> {roleLabel} {time ? `• ${time}` : ""}
          </div>
          <div className={`rounded-xl border ${cardBorder} p-3`}>
            <div className={`flex items-center gap-2 text-sm font-semibold ${variant === "meeting" ? "text-white/90" : "text-text"}`}>
              <BarChart3 className="h-4 w-4" />
              Poll
            </div>
            <div className={`mt-2 text-sm font-semibold ${baseTextColor}`}>{question}</div>
            {!isTutor && (
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (p) {
                      setActivePoll(p);
                      setPollPopupOpen(true);
                    }
                  }}
                >
                  Answer
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (m.type === "poll-answer") {
      const optionText = m.optionText || String(m.message || "").trim();
      const p = polls.find((x) => x?.id === m.pollId) || m.poll || null;
      const question = p?.question || "";
      return (
        <div className="space-y-1">
          <div className={`text-xs ${mutedTextColor}`}>
            <span className="font-semibold">{name}</span> {roleLabel} {time ? `• ${time}` : ""}
          </div>
          <div className={`rounded-xl border ${cardBorder} p-3`}>
            {question ? <div className={`text-xs ${mutedTextColor}`}>Poll: {question}</div> : null}
            <div className={`mt-1 text-sm ${baseTextColor}`}>
              <span className="font-semibold">Answered:</span> {optionText}
            </div>
          </div>
        </div>
      );
    }

    if (m.type === "poll-results") {
      const p = polls.find((x) => x?.id === m.pollId) || m.poll || null;
      const question = p?.question || (m.message || "").replace("[POLL RESULT]", "").split("—")[0].trim();
      const options = p?.options || [];
      const counts = p?.counts || [];
      const max = Math.max(1, ...(counts || [0]));
      return (
        <div className="space-y-1">
          <div className={`text-xs ${mutedTextColor}`}>
            <span className="font-semibold">{isSystem ? "System" : name}</span> {roleLabel} {time ? `• ${time}` : ""}
          </div>
          <div className={`rounded-xl border ${cardBorder} p-3`}>
            <div className={`flex items-center gap-2 text-sm font-semibold ${variant === "meeting" ? "text-white/90" : "text-text"}`}>
              <BarChart3 className="h-4 w-4" />
              Results
            </div>
            {question ? <div className={`mt-2 text-sm font-semibold ${baseTextColor}`}>{question}</div> : null}
            <div className="mt-3 space-y-2">
              {options.map((opt, idx) => {
                const c = counts?.[idx] ?? 0;
                const pct = Math.round((c / max) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className={`flex items-center justify-between text-xs ${mutedTextColor}`}>
                      <span className="font-semibold">{opt}</span>
                      <span>{c}</span>
                    </div>
                    <div className={`h-2 w-full overflow-hidden rounded-full ${variant === "meeting" ? "bg-white/10" : "bg-brintelli-baseAlt"}`}>
                      <div
                        className={`h-2 rounded-full ${variant === "meeting" ? "bg-emerald-400/80" : "bg-emerald-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Default comment
    if (variant === "meeting") {
      return (
        <div className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[92%] rounded-2xl px-3 py-2 ${fromMe ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10"}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold text-white/70">
                {!fromMe ? (
                  <>
                    {name} <span className="text-white/40">{roleLabel}</span>
                  </>
                ) : (
                  "You"
                )}
              </div>
              <div className="text-[11px] font-semibold text-white/40">
                {toLabel}{time ? ` • ${time}` : ""}
              </div>
            </div>
            <div className="mt-1 text-sm text-white/90 leading-relaxed">{renderMessageWithHighlights(m.message)}</div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[92%] rounded-2xl px-3 py-2 ${fromMe ? "bg-emerald-50 border border-emerald-200" : "bg-white border border-brintelli-border"}`}>
          <div className="flex items-center justify-between gap-2">
            <div className={`text-[11px] font-semibold ${fromMe ? "text-emerald-800" : "text-textMuted"}`}>
              {!fromMe ? `${name} ${roleLabel}` : "You"}
            </div>
            <div className="text-[11px] font-semibold text-textMuted">
              {toLabel}{time ? ` • ${time}` : ""}
            </div>
          </div>
          <div className={`mt-1 text-sm ${baseTextColor}`}>{renderMessageWithHighlights(m.message)}</div>
        </div>
      </div>
    );
  };

  const myJoinLink = `${window.location.origin}${isTutor ? "/tutor" : "/student"}/sessions/${sessionId}/live`;
  const isLive = !!screenStreamRef.current || !!cameraStreamRef.current || session?.status === "ONGOING";
  const hasRecordingPublished = !!recordingUrlLocal || !!session?.recordingUrl;
  const controlsEnabled = isTutor ? sessionStatus === "ONGOING" : true;

  useEffect(() => {
    if (session?.status) setSessionStatus(session.status);
  }, [session?.status]);

  const teardownPeers = () => {
    pcsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch {
        // ignore
      }
    });
    pcsRef.current.clear();
  };

  const emitStreamMeta = () => {
    if (!socket) return;
    socket.emit("stream:meta", {
      sessionId,
      screenStreamId: screenStreamRef.current?.id || null,
      cameraStreamId: cameraStreamRef.current?.id || null,
    });
  };

  // Load enrolled students (tutor view)
  useEffect(() => {
    if (!isTutor) return;
    const batchId = session?.batchId;
    if (!batchId) return;
    (async () => {
      try {
        const resp = await tutorAPI.getBatchStudents(batchId);
        if (resp?.success) {
          setEnrolledStudents(resp.data?.students || []);
          setEnrolledBatch(resp.data?.batch || null);
        }
      } catch {
        // non-fatal
      }
    })();
  }, [isTutor, session?.batchId]);

  // If only camera exists, show it in the main stage; if screen exists, keep screen main.

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (cameraPreviewRef.current) cameraPreviewRef.current.srcObject = null;
    setMicMuted(false);
    setBroadcastMode(screenStreamRef.current ? "screen" : null);
    emitStreamMeta();
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (screenMicStreamRef.current) {
      try {
        screenMicStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      screenMicStreamRef.current = null;
      screenMicTrackRef.current = null;
    }
    if (screenPreviewRef.current) screenPreviewRef.current.srcObject = null;
    setBroadcastMode(cameraStreamRef.current ? "camera" : null);
    emitStreamMeta();
  };

  const stopAllBroadcast = () => {
    stopScreenShare();
    stopCamera();
    teardownPeers();
    toast.success("Broadcast stopped");
  };

  const toggleCamera = async () => {
    if (!isTutor) return;
    if (cameraStreamRef.current) {
      stopCamera();
      await rebuildPeersForAllViewers();
      toast.success("Camera stopped");
      return;
    }
    await startCamera();
  };

  const toggleScreenShare = async () => {
    if (!isTutor) return;
    if (screenStreamRef.current) {
      stopScreenShare();
      await rebuildPeersForAllViewers();
      toast.success("Screen share stopped");
      return;
    }
    await startScreenShare();
  };

  const ensurePeerForViewer = async (viewerSocketId) => {
    if (!socket) return;
    if (!screenStreamRef.current && !cameraStreamRef.current) return;
    if (!viewerSocketId) return;
    if (viewerSocketId === socket.id) return;

    if (pcsRef.current.has(viewerSocketId)) return;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcsRef.current.set(viewerSocketId, pc);

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, screenStreamRef.current);
      });
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, cameraStreamRef.current);
      });
    }

    pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        socket.emit("webrtc:signal", {
          sessionId,
          to: viewerSocketId,
          data: { type: "ice", candidate: evt.candidate },
        });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("webrtc:signal", {
      sessionId,
      to: viewerSocketId,
      data: { type: "offer", sdp: offer },
    });
  };

  const rebuildPeersForAllViewers = async () => {
    if (!socket) return;
    // Close existing PCs and recreate (simplest + reliable when adding/removing tracks)
    const viewerSocketIds = participants
      .map((p) => p.socketId)
      .filter((sid) => sid && sid !== socket.id);

    viewerSocketIds.forEach((sid) => {
      const pc = pcsRef.current.get(sid);
      if (pc) {
        try {
          pc.close();
        } catch {
          // ignore
        }
        pcsRef.current.delete(sid);
      }
    });

    await Promise.all(viewerSocketIds.map((sid) => ensurePeerForViewer(sid)));
  };

  const startScreenShare = async () => {
    if (!socket) return;
    if (isTutor && !controlsEnabled) {
      toast.error("Start the session first");
      return;
    }
    if (!window.isSecureContext) {
      toast.error("Screen share requires HTTPS (or localhost). Open the site over https://");
      return;
    }
    if (!navigator?.mediaDevices?.getDisplayMedia) {
      toast.error("Screen sharing is not supported in this browser/environment.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // mic audio comes from camera stream to avoid echo
      });
      screenStreamRef.current = stream;

      // If camera isn't started, capture mic audio and attach to the screen stream so students can hear.
      if (!cameraStreamRef.current) {
        try {
          if (!navigator?.mediaDevices?.getUserMedia) {
            // can't capture mic in this environment
            throw new Error("getUserMedia is not available");
          }
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          const micTrack = micStream.getAudioTracks?.()?.[0] || null;
          if (micTrack) {
            stream.addTrack(micTrack);
            screenMicStreamRef.current = micStream;
            screenMicTrackRef.current = micTrack;
            setMicMuted(false);
          }
        } catch {
          // non-fatal: screen share can still work without mic audio
        }
      }
      if (screenPreviewRef.current) {
        screenPreviewRef.current.srcObject = stream;
      }
      
      // Handle screen share end (user clicks stop in browser)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          stopScreenShare();
          rebuildPeersForAllViewers();
          toast.info("Screen share ended");
        };
      });
      
      setBroadcastMode("screen");
      emitStreamMeta();
      await rebuildPeersForAllViewers();
      toast.success("Screen share started");

      // Auto-stop if user ends share from browser UI
      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
          rebuildPeersForAllViewers();
        };
      }
    } catch (e) {
      console.error("startScreenShare error:", e);
      toast.error(e?.message || "Failed to start screen share");
    }
  };

  const startCamera = async () => {
    if (!socket) return;
    if (isTutor && !controlsEnabled) {
      toast.error("Start the session first");
      return;
    }
    if (!window.isSecureContext) {
      toast.error("Camera/mic requires HTTPS (or localhost). Open the site over https://");
      return;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      toast.error("Camera/microphone is not supported in this browser/environment.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      cameraStreamRef.current = stream;
      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = stream;
      }
      setBroadcastMode("camera");
      setMicMuted(false);
      emitStreamMeta();
      await rebuildPeersForAllViewers();
      toast.success("Camera started");
    } catch (e) {
      console.error("startCamera error:", e);
      toast.error(e?.message || "Failed to start camera");
    }
  };

  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit("session:join", { sessionId });

    const onParticipants = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setParticipants(payload.participants || []);
    };
    const onChat = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setMessages((prev) => [...prev, payload].slice(-200));
    };

    const onSessionSnapshot = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      const timeline = payload?.timeline || [];
      const snapshotPolls = payload?.polls || [];
      const snapshotRecs = payload?.recordings || [];
      const snapshotLeaderboard = payload?.leaderboard || {};
      
      // Convert leaderboard object to array
      if (snapshotLeaderboard && typeof snapshotLeaderboard === 'object') {
        const leaderboardArray = Object.entries(snapshotLeaderboard).map(([userId, score]) => ({
          userId,
          name: "Unknown", // Will be updated from participants
          email: "",
          score: Number(score) || 0,
        }));
        setLeaderboard(leaderboardArray);
      }

      // Render timeline into the Comments feed so students see resources/polls history too.
      const timelineAsMessages = (timeline || []).map((ev) => {
        if (ev?.type === "resource") {
          return {
            sessionId,
            ts: ev.ts,
            user: ev.user,
            message: `[RESOURCE] ${ev.resource?.title || ev.resource?.url}`,
            resource: ev.resource,
            type: "resource",
          };
        }
        if (ev?.type === "poll") {
          const poll = (snapshotPolls || []).find((p) => p?.id === ev.pollId);
          return {
            sessionId,
            ts: ev.ts,
            user: ev.user,
            message: `[POLL] ${poll?.question || "Poll created"}`,
            pollId: ev.pollId,
            type: "poll",
          };
        }
        return {
          sessionId,
          ts: ev.ts,
          user: ev.user,
          message: ev.message,
          mentions: ev.mentions || [],
          type: "comment",
        };
      });

      setMessages(timelineAsMessages.slice(-200));
      setPolls(snapshotPolls);
      setSessionRecordings(snapshotRecs);

      // Learner: show latest unanswered poll as a popup
      if (!isTutor && snapshotPolls.length > 0) {
        const uid = String(user?.id || user?._id || "");
        const latest = snapshotPolls[snapshotPolls.length - 1];
        const answered = !!(uid && latest?.votes && latest.votes[uid] !== undefined);
        if (!answered) {
          setActivePoll(latest);
          setPollPopupOpen(true);
        }
      }
    };
    const onResource = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.resource) {
        setResources((prev) => [payload.resource, ...prev].slice(0, 100));
        // Also show in Comments feed
        setMessages((prev) =>
          [
            ...prev,
            {
              sessionId,
              ts: payload.resource.ts,
              user: payload.resource.sharedBy,
              message: `[RESOURCE] ${payload.resource.title || payload.resource.url}`,
              resource: payload.resource,
              type: "resource",
            },
          ].slice(-200)
        );
      }
    };
    const onPollSnapshot = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setPolls(payload.polls || []);
    };
    const onPollNew = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.poll) {
        setPolls((prev) => [payload.poll, ...prev]);
        // Also show in Comments feed
        setMessages((prev) =>
          [
            ...prev,
            {
              sessionId,
              ts: payload.poll.ts,
              user: payload.poll.createdBy,
              message: `[POLL] ${payload.poll.question}`,
              pollId: payload.poll.id,
              type: "poll",
            },
          ].slice(-200)
        );

        // Learner: pop up poll immediately
        if (!isTutor) {
          setActivePoll(payload.poll);
          setPollPopupOpen(true);
        }
      }
    };
    const onPollUpdate = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (!payload?.poll) return;
      setPolls((prev) => prev.map((p) => (p.id === payload.poll.id ? payload.poll : p)));
      if (activePoll?.id === payload.poll.id) setActivePoll(payload.poll);

      // Upsert a "results" line into Comments
      const poll = payload.poll;
      setMessages((prev) => {
        const next = (prev || []).filter((m) => !(m?.type === "poll-results" && m?.pollId === poll.id));
        return [
          ...next,
          {
            sessionId,
            ts: new Date().toISOString(),
            user: { name: "System", role: "system" },
            message: poll.question,
            pollId: poll.id,
            type: "poll-results",
            poll,
          },
        ].slice(-200);
      });
    };

    const onPollAnswer = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setMessages((prev) =>
        [
          ...prev,
          {
            sessionId,
            ts: payload?.ts || new Date().toISOString(),
            user: payload?.user,
            message: payload?.optionText || `Option ${Number(payload?.optionIndex ?? 0) + 1}`,
            pollId: payload?.pollId,
            type: "poll-answer",
            optionIndex: payload?.optionIndex,
            optionText: payload?.optionText,
            poll: payload?.poll
          },
        ].slice(-200)
      );
    };

    const onPollDraft = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.poll) {
        setPolls((prev) => {
          const existing = prev.find((p) => p.id === payload.poll.id);
          if (existing) {
            return prev.map((p) => (p.id === payload.poll.id ? payload.poll : p));
          }
          return [payload.poll, ...prev];
        });
      }
    };

    const onPollPublished = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.poll) {
        setPolls((prev) => prev.map((p) => (p.id === payload.poll.id ? payload.poll : p)));
        // Show poll to students
        if (!isTutor) {
          setActivePoll(payload.poll);
          setPollPopupOpen(true);
          playNotificationSound();
        }
        // Add to timeline
        setMessages((prev) =>
          [
            ...prev,
            {
              sessionId,
              ts: payload.poll.publishedAt || new Date().toISOString(),
              user: payload.poll.createdBy,
              message: `[POLL] ${payload.poll.question}`,
              pollId: payload.poll.id,
              type: "poll",
            },
          ].slice(-200)
        );
      }
    };

    const onPollCorrectAnswer = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.poll) {
        setPolls((prev) => prev.map((p) => (p.id === payload.poll.id ? payload.poll : p)));
      }
      if (payload?.scores) {
        // Update leaderboard from scores
        setLeaderboard((prev) => {
          const updated = prev.map((e) => ({ ...e })); // Create new array with new objects
          Object.entries(payload.scores).forEach(([userId, points]) => {
            const existingIdx = updated.findIndex((e) => String(e.userId) === String(userId));
            if (existingIdx >= 0) {
              // Update existing entry
              updated[existingIdx] = {
                ...updated[existingIdx],
                score: (updated[existingIdx].score || 0) + points,
              };
            } else {
              // Need to get user info from participants
              const participant = participants.find((p) => String(p.id || p._id) === String(userId));
              updated.push({
                userId,
                name: participant?.name || "Unknown",
                email: participant?.email || "",
                score: points,
              });
            }
          });
          return updated;
        });
      }
    };

    const onStreamMeta = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      const next = {
        screenStreamId: payload.screenStreamId || null,
        cameraStreamId: payload.cameraStreamId || null,
      };
      streamMetaRef.current = next;
      setStreamMeta(next);
    };

    const onSessionStatus = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.status) setSessionStatus(payload.status);
    };

    // WebRTC signaling receiver
    const onWebrtcSignal = async (payload) => {
      if (payload?.sessionId !== sessionId) return;
      const from = payload?.from;
      const data = payload?.data;
      if (!from || !data) return;

      // Student handling tutor answer/ice for the student's uplink
      if (!isTutor && data?.purpose === "student-uplink") {
        const pc = uplinkPcRef.current;
        if (!pc) return;
        if (data.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === "ice") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch {
            // ignore
          }
        }
        return;
      }

      // Tutor receiving a student's uplink offer/ice/answer
      if (isTutor && data?.purpose === "student-uplink") {
        let pc = pcsRef.current.get(from);
        if (!pc) {
          pc = new RTCPeerConnection(RTC_CONFIG);
          pcsRef.current.set(from, pc);
          pc.onicecandidate = (evt) => {
            if (evt.candidate) {
              socket.emit("webrtc:signal", { sessionId, to: from, data: { type: "ice", candidate: evt.candidate, purpose: "student-uplink" } });
            }
          };
          pc.ontrack = (evt) => {
            const stream = evt.streams?.[0] || null;
            if (!stream) return;
            setTutorUplinks((prev) => {
              const exists = (prev || []).some((u) => u.socketId === from);
              const userInfo = participants.find((p) => p.socketId === from) || { name: "Student", role: "student" };
              if (exists) {
                return (prev || []).map((u) => (u.socketId === from ? { ...u, stream, user: userInfo } : u));
              }
              return [{ socketId: from, stream, user: userInfo }, ...(prev || [])].slice(0, 8);
            });
          };
        }

        if (data.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:signal", { sessionId, to: from, data: { type: "answer", sdp: answer, purpose: "student-uplink" } });
        } else if (data.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === "ice") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch {
            // ignore
          }
        }
        return;
      }

      // Viewer side (students): only handle offers/ice/answers
      if (!isTutor) {
        let pc = pcsRef.current.get(from);
        if (!pc) {
          pc = new RTCPeerConnection(RTC_CONFIG);
          pcsRef.current.set(from, pc);

          pc.onicecandidate = (evt) => {
            if (evt.candidate) {
              socket.emit("webrtc:signal", {
                sessionId,
                to: from,
                data: { type: "ice", candidate: evt.candidate },
              });
            }
          };

          pc.ontrack = (evt) => {
            const stream = evt.streams?.[0] || null;
            if (!stream) return;
            // Route streams by meta if available; otherwise fill screen then camera
            const meta = streamMetaRef.current || {};
            if (meta.screenStreamId && stream.id === meta.screenStreamId) {
              if (remoteScreenRef.current) remoteScreenRef.current.srcObject = stream;
              setHasRemoteScreen(true);
              return;
            }
            if (meta.cameraStreamId && stream.id === meta.cameraStreamId) {
              if (remoteCameraRef.current) remoteCameraRef.current.srcObject = stream;
              setHasRemoteCamera(true);
              return;
            }

            // Fallback
            if (remoteScreenRef.current && !remoteScreenRef.current.srcObject) {
              remoteScreenRef.current.srcObject = stream;
              setHasRemoteScreen(true);
            } else if (remoteCameraRef.current && !remoteCameraRef.current.srcObject) {
              remoteCameraRef.current.srcObject = stream;
              setHasRemoteCamera(true);
            }
          };
        }

        if (data.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:signal", {
            sessionId,
            to: from,
            data: { type: "answer", sdp: answer },
          });
        } else if (data.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === "ice") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch {
            // ignore
          }
        }
        return;
      }

      // Tutor side: handle answers/ice from viewers
      if (isTutor) {
        const pc = pcsRef.current.get(from);
        if (!pc) return;
        if (data.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === "ice") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch {
            // ignore
          }
        }
      }
    };

    socket.on("session:participants", onParticipants);
    socket.on("chat:message", onChat);
    socket.on("resource:new", onResource);
    socket.on("poll:snapshot", onPollSnapshot);
    socket.on("poll:new", onPollNew);
    socket.on("poll:draft", onPollDraft);
    socket.on("poll:published", onPollPublished);
    socket.on("poll:update", onPollUpdate);
    socket.on("poll:answer", onPollAnswer);
    socket.on("poll:correctAnswer", onPollCorrectAnswer);
    socket.on("session:snapshot", onSessionSnapshot);
    socket.on("stream:meta", onStreamMeta);
    socket.on("webrtc:signal", onWebrtcSignal);
    socket.on("session:status", onSessionStatus);
    socket.on("media:permissions", (payload) => {
      if (payload?.sessionId !== sessionId) return;
      const uid = String(user?.id || user?._id || "");
      if (!uid) return;
      if (String(payload?.userId || "") !== uid) return;
      setMyMediaPerms({
        micAllowed: !!payload.micAllowed,
        camAllowed: !!payload.camAllowed,
        micRequested: !!payload.micRequested,
        camRequested: !!payload.camRequested,
      });
    });
    socket.on("media:request", (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (!isTutor) return;
      setIncomingMediaRequests((prev) => {
        const next = [{ from: payload.from, kind: payload.kind, ts: payload.ts }, ...(prev || [])];
        return next.slice(0, 30);
      });
      toast.success(`${payload?.from?.name || "Student"} requested ${payload?.kind}`);
    });
    socket.on("mention:notify", (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setMentionAlerts((c) => c + 1);
      playNotificationSound();
      toast.success(`You were mentioned by ${payload?.from?.name || "someone"}`);
    });
    socket.on("session:error", (payload) => {
      if (payload?.sessionId !== sessionId) return;
      toast.error(payload?.error || "Unable to join session");
    });

    return () => {
      socket.emit("session:leave", { sessionId });
      socket.off("session:participants", onParticipants);
      socket.off("chat:message", onChat);
      socket.off("resource:new", onResource);
      socket.off("poll:snapshot", onPollSnapshot);
      socket.off("poll:new", onPollNew);
      socket.off("poll:draft", onPollDraft);
      socket.off("poll:published", onPollPublished);
      socket.off("poll:correctAnswer", onPollCorrectAnswer);
      socket.off("poll:update", onPollUpdate);
      socket.off("poll:answer", onPollAnswer);
      socket.off("session:snapshot", onSessionSnapshot);
      socket.off("stream:meta", onStreamMeta);
      socket.off("webrtc:signal", onWebrtcSignal);
      socket.off("session:status", onSessionStatus);
      socket.off("media:permissions");
      socket.off("media:request");
      socket.off("mention:notify");
      if (!isTutor) stopStudentUplink();
      stopAllBroadcast();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, sessionId, isTutor]);

  const requestMedia = (kind) => {
    if (!socket) return;
    socket.emit("media:request", { sessionId, kind });
  };

  const grantMedia = (targetUserId, kind, allowed) => {
    if (!socket) return;
    socket.emit("media:grant", { sessionId, userId: targetUserId, kind, allowed });
    setIncomingMediaRequests((prev) =>
      (prev || []).filter((r) => !(String(r?.from?.id || "") === String(targetUserId) && String(r?.kind || "") === String(kind)))
    );
    // Update local state
    setParticipantMediaPerms((prev) => ({
      ...prev,
      [targetUserId]: {
        ...prev[targetUserId],
        [kind === "camera" ? "camAllowed" : "micAllowed"]: allowed,
      },
    }));
  };

  // Student: start/stop local mic/cam and send to tutor only (1:1 uplink)
  const startStudentUplinkIfNeeded = async () => {
    if (!socket) return null;
    // Find tutor socket id (first tutor in presence list)
    const tutor = (participants || []).find((p) => String(p.role || "").toLowerCase() === "tutor");
    if (!tutor?.socketId) return null;
    const tutorSocketId = tutor.socketId;

    if (uplinkPcRef.current) return tutorSocketId;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    uplinkPcRef.current = pc;

    pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        socket.emit("webrtc:signal", {
          sessionId,
          to: tutorSocketId,
          data: { type: "ice", candidate: evt.candidate },
        });
      }
    };

    // Pre-create transceivers so we can toggle tracks without rebuilding
    pc.addTransceiver("audio", { direction: "sendonly" });
    pc.addTransceiver("video", { direction: "sendonly" });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc:signal", { sessionId, to: tutorSocketId, data: { type: "offer", sdp: offer, purpose: "student-uplink" } });
    return tutorSocketId;
  };

  const stopStudentUplink = () => {
    try {
      studentStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    studentStreamRef.current = null;
    setStudentCamOn(false);
    setStudentMicOn(false);
    try {
      uplinkPcRef.current?.close?.();
    } catch {
      // ignore
    }
    uplinkPcRef.current = null;
  };

  const toggleStudentMic = async () => {
    if (isTutor) return;
    if (!myMediaPerms.micAllowed) {
      requestMedia("mic");
      toast.error("Ask tutor to allow microphone");
      return;
    }
    if (!window.isSecureContext) {
      toast.error("Mic requires HTTPS (or localhost).");
      return;
    }
    const tutorSocketId = await startStudentUplinkIfNeeded();
    if (!tutorSocketId) {
      toast.error("Tutor not connected");
      return;
    }
    const next = !studentMicOn;
    if (next) {
      const stream = studentStreamRef.current || (await navigator.mediaDevices.getUserMedia({ audio: true, video: false }));
      studentStreamRef.current = stream;
      const audioTrack = stream.getAudioTracks?.()?.[0];
      const pc = uplinkPcRef.current;
      const sender = pc.getSenders().find((s) => s.track?.kind === "audio") || pc.getSenders().find((s) => s.track == null);
      if (audioTrack) await sender.replaceTrack(audioTrack);
    } else {
      const pc = uplinkPcRef.current;
      const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
      if (sender) await sender.replaceTrack(null);
    }
    setStudentMicOn(next);
  };

  const toggleStudentCam = async () => {
    if (isTutor) return;
    if (!myMediaPerms.camAllowed) {
      requestMedia("cam");
      toast.error("Ask tutor to allow camera");
      return;
    }
    if (!window.isSecureContext) {
      toast.error("Camera requires HTTPS (or localhost).");
      return;
    }
    const tutorSocketId = await startStudentUplinkIfNeeded();
    if (!tutorSocketId) {
      toast.error("Tutor not connected");
      return;
    }
    const next = !studentCamOn;
    if (next) {
      const stream = studentStreamRef.current || (await navigator.mediaDevices.getUserMedia({ audio: false, video: true }));
      // If existing stream has no video, merge
      if (studentStreamRef.current && studentStreamRef.current.getVideoTracks?.()?.length === 0) {
        const v = stream.getVideoTracks?.()?.[0];
        if (v) studentStreamRef.current.addTrack(v);
      } else {
        studentStreamRef.current = stream;
      }
      const videoTrack = studentStreamRef.current.getVideoTracks?.()?.[0];
      const pc = uplinkPcRef.current;
      const sender = pc.getSenders().find((s) => s.track?.kind === "video") || pc.getSenders().find((s) => s.track == null);
      if (videoTrack) await sender.replaceTrack(videoTrack);
    } else {
      const pc = uplinkPcRef.current;
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(null);
    }
    setStudentCamOn(next);
  };

  // If tutor is sharing and new participants join, create peer for them
  useEffect(() => {
    if (!socket || !isTutor) return;
    if (!screenStreamRef.current && !cameraStreamRef.current) return;
    const viewerSocketIds = participants
      .map((p) => p.socketId)
      .filter((sid) => sid && sid !== socket.id);
    viewerSocketIds.forEach((sid) => {
      ensurePeerForViewer(sid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, socket, isTutor]);

  // Monitor remote video elements for students to update opacity state
  useEffect(() => {
    if (isTutor) return;
    const checkInterval = setInterval(() => {
      if (remoteCameraRef.current) {
        const hasCam = !!remoteCameraRef.current.srcObject;
        if (hasCam !== hasRemoteCamera) setHasRemoteCamera(hasCam);
      }
      if (remoteScreenRef.current) {
        const hasScreen = !!remoteScreenRef.current.srcObject;
        if (hasScreen !== hasRemoteScreen) setHasRemoteScreen(hasScreen);
      }
    }, 500);
    return () => clearInterval(checkInterval);
  }, [isTutor, hasRemoteCamera, hasRemoteScreen]);

  const toggleMic = () => {
    if (isTutor && !controlsEnabled) {
      toast.error("Start the session first");
      return;
    }
    const audioTracks =
      cameraStreamRef.current?.getAudioTracks?.() ||
      (screenMicTrackRef.current ? [screenMicTrackRef.current] : []);
    if (!audioTracks || audioTracks.length === 0) {
      toast.error("No microphone/audio track available");
      return;
    }
    const nextMuted = !micMuted;
    audioTracks.forEach((t) => {
      // enabled=false means muted
      t.enabled = !nextMuted;
    });
    setMicMuted(nextMuted);
    toast.success(nextMuted ? "Mic muted" : "Mic unmuted");
  };

  const toggleSpeaker = () => {
    const nextMuted = !speakerMuted;
    setSpeakerMuted(nextMuted);
    if (remoteScreenRef.current) remoteScreenRef.current.muted = nextMuted;
    if (remoteCameraRef.current) remoteCameraRef.current.muted = nextMuted;
    toast.success(nextMuted ? "Speaker muted" : "Speaker unmuted");
  };

  const toggleHand = () => {
    if (!socket) return;
    const next = !handRaised;
    setHandRaised(next);
    socket.emit("hand:toggle", { sessionId, raised: next });
    toast.success(next ? "Hand raised" : "Hand lowered");
  };

  const sendChat = () => {
    if (!socket) return;
    const msg = chatInput.trim();
    if (!msg) return;

    // Mention capture:
    // - support emails / names
    // - strip trailing punctuation like "," "." ")"
    const mentionTokens = Array.from(msg.matchAll(/@([^\s]+)/g))
      .map((m) => String(m?.[1] || ""))
      .map((t) => t.replace(/[),.;:!?\]]+$/g, ""))
      .filter(Boolean);

    const mentioned = (participants || [])
      .filter((p) => p?.id)
      .filter((p) => {
        const name = String(p?.name || "").toLowerCase();
        return mentionTokens.some((t) => t.toLowerCase() === name);
      })
      .map((p) => p.id);

    socket.emit("chat:send", { sessionId, message: msg, mentions: mentioned, to: chatTo });
    setChatInput("");
    setMentionOpen(false);
    setMentionQuery("");
  };

  const shareResource = () => {
    if (!socket) return;
    const url = resourceUrl.trim();
    if (!url) return;
    socket.emit("resource:share", {
      sessionId,
      url,
      title: resourceTitle.trim() || url,
      type: "link",
    });
    setResourceUrl("");
    setResourceTitle("");
    toast.success("Resource shared");
  };

  const createPoll = () => {
    if (!socket) return;
    const q = pollQuestion.trim();
    const opts = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!q || opts.length < 2) {
      toast.error("Poll needs a question + at least 2 options");
      return;
    }
    socket.emit("poll:create", {
      sessionId,
      question: q,
      options: opts,
      correctAnswer: pollCorrectAnswer !== null ? pollCorrectAnswer : undefined,
    });
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollCorrectAnswer(null);
    setShowPollComposer(false);
  };

  const vote = (pollId, optionIndex) => {
    if (!socket) return;
    // Check if poll is published
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || !poll.published) {
      toast.error("This poll is not published yet");
      return;
    }
    socket.emit("poll:vote", { sessionId, pollId, optionIndex });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(myJoinLink);
      toast.success("Join link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const openMeeting = () => {
    if (session?.meetingLink) {
      window.open(session.meetingLink, "_blank", "noopener,noreferrer");
    } else {
      // Fall back to the internal live room link so there is always something usable.
      window.open(myJoinLink, "_blank", "noopener,noreferrer");
      toast("No meeting link configured — opened the live room link instead", { icon: "ℹ️" });
    }
  };

  const startSession = async () => {
    if (!socket) return;

    // Ensure meetingLink is saved once it's available (or set a sensible default).
    // This helps students find the link in Live Classes / Sessions lists.
    if (isTutor) {
      try {
        const meetingLinkToSave = session?.meetingLink || myJoinLink;
        await tutorAPI.updateSession(sessionId, { meetingLink: meetingLinkToSave });
      } catch (e) {
        // Non-fatal: realtime start can proceed even if persistence fails
        console.warn("Failed to save meetingLink:", e);
      }
    }

    socket.emit("session:start", { sessionId });
    setSessionStatus("ONGOING");
    toast.success("Session started");
  };

  const endSession = () => {
    if (!socket) return;
    socket.emit("session:end", { sessionId });
    setSessionStatus("COMPLETED");
    toast.success("Session ended");
  };

  const publishRecording = async () => {
    if (!isTutor) return;
    const url = recordingUrl.trim();
    if (!url) {
      toast.error("Paste a recording URL first");
      return;
    }
    try {
      setSavingRecording(true);
      await tutorAPI.updateSession(sessionId, { recordingUrl: url, status: "COMPLETED" });
      toast.success("Recording published");
      setRecordingUrlLocal(url);
      setRecordingUrl("");
    } catch (e) {
      toast.error(e?.message || "Failed to publish recording");
    } finally {
      setSavingRecording(false);
    }
  };

  const startRecording = async () => {
    if (!isTutor) return;
    if (isRecording) return;
    if (!controlsEnabled) {
      toast.error("Start the session first");
      return;
    }
    if (!screenStreamRef.current && !cameraStreamRef.current) {
      toast.error("Start camera and/or screen share first");
      return;
    }

    try {
      recordingChunksRef.current = [];

      // Compose: screen as background, camera PiP bottom-right
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      const draw = () => {
        if (!ctx) return;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const screenVideoEl = screenPreviewRef.current;
        const cameraVideoEl = cameraPreviewRef.current;

        if (screenVideoEl && screenStreamRef.current) {
          ctx.drawImage(screenVideoEl, 0, 0, canvas.width, canvas.height);
        } else if (cameraVideoEl && cameraStreamRef.current) {
          ctx.drawImage(cameraVideoEl, 0, 0, canvas.width, canvas.height);
        }

        if (cameraVideoEl && cameraStreamRef.current && screenStreamRef.current) {
          const pipW = Math.round(canvas.width * 0.25);
          const pipH = Math.round((pipW * 9) / 16);
          const pad = 16;
          const x = canvas.width - pipW - pad;
          const y = canvas.height - pipH - pad;
          // Border
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(x - 4, y - 4, pipW + 8, pipH + 8);
          ctx.drawImage(cameraVideoEl, x, y, pipW, pipH);
        }

        recordingAnimRef.current = requestAnimationFrame(draw);
      };
      draw();

      const outStream = canvas.captureStream(30);
      const audioTrack =
        cameraStreamRef.current?.getAudioTracks?.()?.[0] ||
        screenMicTrackRef.current ||
        null;
      if (audioTrack) outStream.addTrack(audioTrack);

      const mimeCandidates = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "";
      const recorder = new MediaRecorder(outStream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) recordingChunksRef.current.push(evt.data);
      };
      recorder.onstop = async () => {
        try {
          if (recordingAnimRef.current) cancelAnimationFrame(recordingAnimRef.current);
          const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType || "video/webm" });
          const file = new File([blob], `session_${sessionId}.webm`, { type: blob.type });
          setSavingRecording(true);
          const resp = await tutorAPI.uploadSessionRecording(sessionId, file);
          const url = resp?.data?.url;
          if (url) {
            setRecordingUrlLocal(url);
            toast.success("Recording uploaded & saved");
          } else {
            toast.success("Recording uploaded");
          }
        } catch (e) {
          toast.error(e?.message || "Failed to upload recording");
        } finally {
          setSavingRecording(false);
          setIsRecording(false);
        }
      };

      recorder.start(1000);
      setIsRecording(true);
      toast.success("Recording started");
    } catch (e) {
      console.error("startRecording error:", e);
      toast.error(e?.message || "Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (!isTutor) return;
    if (!isRecording) return;
    try {
      mediaRecorderRef.current?.stop?.();
    } catch {
      // ignore
    }
  };

  // Pre-join screen handlers
  const togglePreJoinCam = async () => {
    if (preJoinCamOn) {
      if (preJoinStreamRef.current) {
        preJoinStreamRef.current.getTracks().forEach((t) => t.stop());
        preJoinStreamRef.current = null;
      }
      if (preJoinVideoRef.current) preJoinVideoRef.current.srcObject = null;
      setPreJoinCamOn(false);
    } else {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          toast.error("Camera access is not available. Please use HTTPS or localhost.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        preJoinStreamRef.current = stream;
        if (preJoinVideoRef.current) preJoinVideoRef.current.srcObject = stream;
        setPreJoinCamOn(true);
      } catch (e) {
        console.error("Pre-join camera error:", e);
        toast.error("Failed to access camera");
      }
    }
  };

  const togglePreJoinMic = async () => {
    if (preJoinMicOn) {
      if (preJoinStreamRef.current) {
        preJoinStreamRef.current.getAudioTracks().forEach((t) => t.stop());
      }
      setPreJoinMicOn(false);
    } else {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          toast.error("Microphone access is not available. Please use HTTPS or localhost.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        if (preJoinStreamRef.current) {
          // Add audio track to existing stream
          stream.getAudioTracks().forEach((track) => {
            preJoinStreamRef.current.addTrack(track);
          });
        } else {
          preJoinStreamRef.current = stream;
        }
        setPreJoinMicOn(true);
      } catch (e) {
        console.error("Pre-join mic error:", e);
        toast.error("Failed to access microphone");
      }
    }
  };

  const handleJoinMeeting = async () => {
    // For students: if they had camera/mic on in pre-join, request access
    if (!isTutor) {
      if (preJoinCamOn) {
        setMyMediaPerms((prev) => ({ ...prev, camRequested: true }));
        // Emit request for camera
        if (socket) {
          socket.emit("media:request", { sessionId, kind: "camera" });
        }
      }
      if (preJoinMicOn) {
        setMyMediaPerms((prev) => ({ ...prev, micRequested: true }));
        // Emit request for microphone
        if (socket) {
          socket.emit("media:request", { sessionId, kind: "mic" });
        }
      }
    }

    // Clean up pre-join stream
    if (preJoinStreamRef.current) {
      preJoinStreamRef.current.getTracks().forEach((t) => t.stop());
      preJoinStreamRef.current = null;
    }
    if (preJoinVideoRef.current) preJoinVideoRef.current.srcObject = null;
    setHasJoined(true);
  };

  // Pre-join screen - only for tutors, students join directly
  if (uiVariant === "meeting" && !hasJoined) {
    if (!isTutor) {
      // Students join directly without pre-join (camera/mic off by default)
      handleJoinMeeting();
      return null;
    }
    // Pre-join screen for tutors only
  return (
      <div className="h-screen w-screen overflow-hidden bg-[#0b0f1a] text-white flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{session?.name || "Live Class"}</h1>
            <p className="text-white/60 text-sm">Ready to join? Check your camera and microphone settings.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
            {/* Video Preview */}
            <div className="relative w-full lg:w-[640px] h-[360px] bg-black rounded-xl overflow-hidden border border-white/10">
              {preJoinCamOn ? (
                <video
                  ref={preJoinVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-16 w-16 mx-auto mb-4 text-white/40" />
                    <p className="text-white/60 text-sm">Camera is off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="flex flex-col gap-3">
                <Button
                  variant={preJoinCamOn ? "primary" : "secondary"}
                  className="gap-2 w-full lg:w-[200px]"
                  onClick={togglePreJoinCam}
                >
                  <Camera className="h-4 w-4" />
                  {preJoinCamOn ? "Camera On" : "Turn On Camera"}
                </Button>

                <Button
                  variant={preJoinMicOn ? "primary" : "secondary"}
                  className="gap-2 w-full lg:w-[200px]"
                  onClick={togglePreJoinMic}
                >
                  {preJoinMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {preJoinMicOn ? "Microphone On" : "Turn On Microphone"}
                </Button>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <Button
                  variant="primary"
                  className="gap-2 w-full lg:w-[200px] text-base py-3"
                  onClick={handleJoinMeeting}
                >
                  <Video className="h-5 w-5" />
                  Join Meeting
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2 w-full lg:w-[200px] text-sm"
                  onClick={handleJoinMeeting}
                >
                  Join without camera and microphone
                </Button>
              </div>

              {!window.isSecureContext && window.location.hostname !== "localhost" && (
                <p className="text-xs text-amber-400/80 mt-2 text-center">
                  ⚠️ Camera and microphone require HTTPS in production
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (uiVariant === "meeting") {
  return (
    <>
        <style>{`
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="h-screen w-screen overflow-hidden bg-[#0b0f1a] text-white flex flex-col">
        {/* Learner Poll Popup */}
        {!isTutor && pollPopupOpen && activePoll && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={pollDialogTitleId}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setPollPopupOpen(false);
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white p-5 text-text shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-textMuted">Poll</div>
                  <div id={pollDialogTitleId} className="mt-1 text-lg font-semibold text-text">
                    {activePoll.question}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setPollPopupOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {activePoll.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    ref={idx === 0 ? firstPollOptionRef : null}
                    className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                    onClick={() => {
                      vote(activePoll.id, idx);
                      toast.success("Answer submitted");
                      setPollPopupOpen(false);
                    }}
                  >
                    <span className="font-semibold text-textSoft">{opt}</span>
                    <span className="text-xs font-semibold text-textMuted">{activePoll.counts?.[idx] ?? 0}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 text-xs text-textMuted">Answer now — your response is recorded instantly.</div>
            </div>
          </div>
        )}

        {/* Top meeting bar */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {session?.name ? session.name : "Live Class"}
              <span className="ml-2 text-xs font-semibold text-white/60">({sessionStatus})</span>
            </div>
            <div className="text-xs text-white/60 truncate">{myJoinLink}</div>
          </div>
          <div className="flex items-center gap-2">
            {isTutor && (
              <>
                <Button variant="secondary" className="gap-2" onClick={startSession}>
                  <Play className="h-4 w-4" />
                  Start
                </Button>
                <Button variant="secondary" className="gap-2" onClick={endSession}>
                  <StopCircle className="h-4 w-4" />
                  End
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              className="gap-2 lg:hidden"
              onClick={() => setChatDrawerOpen(true)}
              aria-label="Open chat"
              title="Open chat"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button variant="secondary" onClick={copyLink}>
              Copy link
            </Button>
          </div>
        </div>

        {/* Mobile Chat Drawer */}
        <div className={`${chatDrawerOpen ? "fixed" : "hidden"} inset-0 z-[90] bg-black/60 lg:hidden`} onMouseDown={(e) => {
          if (e.target === e.currentTarget) setChatDrawerOpen(false);
        }}>
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[#0d1326] border-l border-white/10 flex flex-col" onMouseDown={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-white/80" />
                Chat
              </div>
              <Button variant="secondary" onClick={() => setChatDrawerOpen(false)} aria-label="Close chat">
                Close
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto px-4 py-4" ref={chatScrollRef} onScroll={onChatScroll}>
              {messages.length === 0 ? (
                <div className="text-sm text-white/60">No messages yet.</div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m, idx) => (
                    <div key={`${m.ts}_${idx}`} className="text-sm">
                      {renderChatMessage(m, { variant: "meeting" })}
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-2 pb-2">
                <label className="text-xs font-semibold text-white/60" htmlFor="chatToDrawer">
                  To
                </label>
                <select
                  id="chatToDrawer"
                  value={chatTo}
                  onChange={(e) => setChatTo(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-white/30"
                  aria-label="Send chat to"
                >
                  <option value="everyone">Everyone</option>
                  {isTutor && <option value="tutors">Tutors only</option>}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => (e.key === "Enter" ? sendChat() : null)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  placeholder="Type a message…"
                  aria-label="Chat message"
                />
                <Button onClick={sendChat} aria-label="Send message">Send</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout: left sidebar (tutor only) + stage + right panel */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar - Tutor Only */}
          {isTutor && (
            <div className={`${showLeftSidebar ? "w-[320px]" : "w-0"} flex-shrink-0 border-r border-white/10 bg-[#0d1326] flex flex-col transition-all duration-200 overflow-hidden`}>
              {showLeftSidebar && (
                <>
                  {/* Sidebar Header */}
                  <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Users className="h-4 w-4 text-white/80" />
                      Participants
                    </div>
                    <Button variant="secondary" onClick={() => setShowLeftSidebar(false)} aria-label="Hide sidebar">
                      ←
                    </Button>
                  </div>

                  {/* Tabs: Students, Polls, Leaderboard */}
                  <div className="flex-shrink-0 flex border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => setLeftSidebarTab("students")}
                      className={`flex-1 px-3 py-2 text-xs font-semibold hover:bg-white/5 ${
                        leftSidebarTab === "students"
                          ? "text-white/90 border-b-2 border-white/80"
                          : "text-white/60"
                      }`}
                    >
                      Students
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftSidebarTab("polls")}
                      className={`flex-1 px-3 py-2 text-xs font-semibold hover:bg-white/5 ${
                        leftSidebarTab === "polls"
                          ? "text-white/90 border-b-2 border-white/80"
                          : "text-white/60"
                      }`}
                    >
                      Polls
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftSidebarTab("leaderboard")}
                      className={`flex-1 px-3 py-2 text-xs font-semibold hover:bg-white/5 ${
                        leftSidebarTab === "leaderboard"
                          ? "text-white/90 border-b-2 border-white/80"
                          : "text-white/60"
                      }`}
                    >
                      Leaderboard
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    {leftSidebarTab === "students" && (
                      <>
                        {participants.length === 0 ? (
                          <div className="p-4 text-sm text-white/60 text-center">No participants yet.</div>
                        ) : (
                          <div className="p-2 space-y-2">
                            {participants
                              .filter((p) => p.role !== "tutor" && p.role !== "admin")
                              .map((p) => (
                                <div
                                  key={p.socketId || p.id}
                                  className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-white/90 truncate">{p.name}</div>
                                      {p.handRaised && (
                                        <div className="text-xs text-amber-400 mt-1">✋ Hand raised</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant={participantMediaPerms[p.id]?.camAllowed ? "primary" : "secondary"}
                                      className="gap-1 text-xs px-2 py-1"
                                      onClick={() => grantMedia(p.id, "camera", !participantMediaPerms[p.id]?.camAllowed)}
                                      title={participantMediaPerms[p.id]?.camAllowed ? "Disable camera" : "Enable camera"}
                                    >
                                      <Camera className="h-3 w-3" />
                                      {participantMediaPerms[p.id]?.camAllowed ? "Cam On" : "Cam Off"}
                                    </Button>
                                    <Button
                                      variant={participantMediaPerms[p.id]?.micAllowed ? "primary" : "secondary"}
                                      className="gap-1 text-xs px-2 py-1"
                                      onClick={() => grantMedia(p.id, "mic", !participantMediaPerms[p.id]?.micAllowed)}
                                      title={participantMediaPerms[p.id]?.micAllowed ? "Disable mic" : "Enable mic"}
                                    >
                                      {participantMediaPerms[p.id]?.micAllowed ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                                      {participantMediaPerms[p.id]?.micAllowed ? "Mic On" : "Mic Off"}
                                    </Button>
                                    {p.handRaised && (
                                      <Button
                                        variant="secondary"
                                        className="gap-1 text-xs px-2 py-1"
                                        onClick={() => {
                                          if (socket) {
                                            socket.emit("hand:toggle", { sessionId, raised: false });
                                          }
                                        }}
                                        title="Lower hand"
                                      >
                                        <Hand className="h-3 w-3" />
                                        Lower
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}

                    {leftSidebarTab === "polls" && (
                      <div className="flex flex-col h-full">
                        {/* Poll Creation Form */}
                        {isTutor && (
                          <div className="flex-shrink-0 p-2 border-b border-white/10">
                            <div className="rounded-lg border border-white/10 bg-black/20 p-2 space-y-2">
                              <div className="text-xs font-semibold text-white/70">Create Poll</div>
                              <input
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-white/30"
                                placeholder="Poll question…"
                              />
                              <div className="space-y-1">
                                {pollOptions.map((opt, idx) => (
                                  <input
                                    key={idx}
                                    value={opt}
                                    onChange={(e) => {
                                      const next = [...pollOptions];
                                      next[idx] = e.target.value;
                                      setPollOptions(next);
                                    }}
                                    className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
                                    placeholder={`Option ${idx + 1}`}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="secondary"
                                  className="flex-1 text-xs py-1"
                                  onClick={() => setPollOptions((p) => (p.length < 10 ? [...p, ""] : p))}
                                >
                                  Add Option
                                </Button>
                                <Button
                                  variant="primary"
                                  className="flex-1 text-xs py-1"
                                  onClick={createPoll}
                                >
                                  Create
                                </Button>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-white/70">Correct Answer (optional):</label>
                                <select
                                  value={pollCorrectAnswer !== null ? pollCorrectAnswer : ""}
                                  onChange={(e) => setPollCorrectAnswer(e.target.value ? Number(e.target.value) : null)}
                                  className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
                                >
                                  <option value="">None</option>
                                  {pollOptions.map((opt, idx) => (
                                    <option key={idx} value={idx}>
                                      {opt || `Option ${idx + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Polls List */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          <style>{`.polls-scroll::-webkit-scrollbar { display: none; }`}</style>
                          <div className="polls-scroll">
                          {polls.length === 0 ? (
                            <div className="p-4 text-sm text-white/60 text-center">No polls yet.</div>
                          ) : (
                            polls.map((poll) => (
                            <div
                              key={poll.id}
                              className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2"
                            >
                              <div className="text-sm font-semibold text-white/90">{poll.question}</div>
                              <div className="text-xs text-white/60">
                                {poll.published ? "Published" : "Draft"}
                                {poll.correctAnswer !== null && " • Answer set"}
                              </div>
                              {!poll.published && (
                                <Button
                                  variant="primary"
                                  className="w-full text-xs py-1"
                                  onClick={() => {
                                    if (socket) {
                                      socket.emit("poll:publish", { sessionId, pollId: poll.id });
                                    }
                                  }}
                                >
                                  Publish
                                </Button>
                              )}
                              {poll.published && poll.correctAnswer === null && (
                                <div className="space-y-1">
                                  <label className="text-xs text-white/70">Set correct answer:</label>
                                  <select
                                    className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
                                    onChange={(e) => {
                                      const idx = Number(e.target.value);
                                      if (!isNaN(idx) && socket) {
                                        socket.emit("poll:correctAnswer", {
                                          sessionId,
                                          pollId: poll.id,
                                          correctAnswer: idx,
                                        });
                                      }
                                    }}
                                  >
                                    <option value="">Select...</option>
                                    {poll.options?.map((opt, idx) => (
                                      <option key={idx} value={idx}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {poll.published && poll.votes && (
                                <div className="text-xs text-white/60">
                                  Votes: {Object.keys(poll.votes).length}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                          </div>
                        </div>
                      </div>
                    )}

                    {leftSidebarTab === "leaderboard" && (
                      <div className="p-2 space-y-2">
                        {leaderboard.length === 0 ? (
                          <div className="p-4 text-sm text-white/60 text-center">No scores yet.</div>
                        ) : (
                          leaderboard
                            .sort((a, b) => b.score - a.score)
                            .map((entry, idx) => (
                              <div
                                key={entry.userId}
                                className="rounded-lg border border-white/10 bg-black/20 p-3 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="text-xs font-semibold text-white/60 w-6">#{idx + 1}</div>
                                  <div>
                                    <div className="text-sm font-semibold text-white/90">{entry.name}</div>
                                    <div className="text-xs text-white/60">{entry.email}</div>
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-emerald-400">{entry.score}</div>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              {!showLeftSidebar && (
                <button
                  type="button"
                  onClick={() => setShowLeftSidebar(true)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#0d1326] border-r border-y border-white/10 px-2 py-4 rounded-r-lg hover:bg-[#0f1628]"
                  aria-label="Show sidebar"
                >
                  →
                </button>
              )}
            </div>
          )}

          {/* Stage */}
          <div className="relative flex-1 min-h-0 bg-black">
            {/* Overlapping video: camera takes priority, then screen share */}
            {isTutor ? (
              <>
                {/* Screen share (background layer) */}
                <video
                  ref={screenPreviewRef}
                  autoPlay
                  playsInline
                  muted={isTutor || speakerMuted}
                  className={`absolute inset-0 h-full w-full object-contain bg-black transition-opacity duration-200 ${
                    cameraStreamRef.current ? "opacity-0 pointer-events-none" : (screenStreamRef.current ? "opacity-100" : "opacity-0")
                  }`}
                  onLoadedMetadata={() => {
                    if (screenPreviewRef.current && screenPreviewRef.current.srcObject) {
                      screenPreviewRef.current.play().catch(() => {});
                    }
                  }}
                />
                {/* Camera (foreground layer, takes priority) */}
                <video
                  ref={cameraPreviewRef}
                  autoPlay
                  playsInline
                  muted={isTutor || speakerMuted}
                  className={`absolute inset-0 h-full w-full object-contain bg-black transition-opacity duration-200 ${
                    cameraStreamRef.current ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  onLoadedMetadata={() => {
                    if (cameraPreviewRef.current && cameraPreviewRef.current.srcObject) {
                      cameraPreviewRef.current.play().catch(() => {});
                    }
                  }}
                />
                {!cameraStreamRef.current && !screenStreamRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-center text-white/40">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-sm">No video stream</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Screen share (background layer) */}
                {hasRemoteScreen && (
                  <video
                    ref={remoteScreenRef}
                    autoPlay
                    playsInline
                    muted={isTutor || speakerMuted}
                    className={`absolute inset-0 h-full w-full object-contain bg-black transition-opacity duration-200 ${
                      hasRemoteCamera ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                  />
                )}
                {/* Camera (foreground layer, takes priority) */}
                {hasRemoteCamera && (
                  <video
                    ref={remoteCameraRef}
                    autoPlay
                    playsInline
                    muted={isTutor || speakerMuted}
                    className="absolute inset-0 h-full w-full object-contain bg-black"
                  />
                )}
                {!hasRemoteCamera && !hasRemoteScreen && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-center text-white/40">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-sm">Waiting for video stream...</p>
                    </div>
                  </div>
                )}
              </>
            )}

              {/* Tutor: student speaker tiles (approved uplinks) */}
              {isTutor && tutorUplinks.length > 0 && (
                <div className="absolute left-4 bottom-4 max-w-[70%]">
                  <div className="flex gap-2 overflow-auto rounded-xl bg-black/30 p-2 backdrop-blur border border-white/10">
                    {tutorUplinks.map((u) => (
                      <div key={u.socketId} className="relative w-[160px] overflow-hidden rounded-lg border border-white/10 bg-black">
                        <video
                          autoPlay
                          playsInline
                          muted
                          ref={(el) => {
                            if (!el) return;
                            if (u.stream && el.srcObject !== u.stream) el.srcObject = u.stream;
                          }}
                          className="h-[96px] w-full object-cover bg-black"
                        />
                        {/* Ensure audio plays too */}
                        <audio
                          autoPlay
                          ref={(el) => {
                            if (!el) return;
                            if (u.stream && el.srcObject !== u.stream) el.srcObject = u.stream;
                          }}
                        />
                        <div className="absolute bottom-1 left-1 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white/90">
                          {u.user?.name || "Student"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right panel (Chat) - Sticky */}
          <div className="hidden lg:flex flex-col border-l border-white/10 bg-[#0d1326] w-[380px] flex-shrink-0 h-full">
            {/* Chat Header - Sticky */}
            <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-white/80" />
                Chat
                {mentionAlerts > 0 && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-200 ring-1 ring-rose-500/30">
                    {mentionAlerts}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold text-white/60">
                  {participants.length} in call{isTutor ? " (click names to @mention)" : ""}
                </div>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Poll composer - Sticky */}

              {/* Participants list - Sticky */}
              {isTutor && (
                <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
                  <div className="max-h-[120px] overflow-auto rounded-xl border border-white/10 bg-black/20 p-2">
                    {participants.length === 0 ? (
                      <div className="text-xs text-white/60 px-2 py-1">No participants yet.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {participants.map((p) => (
                          <button
                            key={p.socketId || p.id}
                            type="button"
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
                            onClick={() => setChatInput((prev) => (prev ? `${prev} @${p.name} ` : `@${p.name} `))}
                            title="Click to @mention"
                          >
                            {p.name}
                            {p.handRaised ? " ✋" : ""}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tutor: incoming mic/cam requests - Sticky */}
              {isTutor && incomingMediaRequests.length > 0 && (
                <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs font-semibold text-white/70">Requests</div>
                    <div className="mt-2 space-y-2">
                      {incomingMediaRequests.slice(0, 8).map((r, idx) => (
                        <div key={`${r?.from?.id}_${r?.kind}_${idx}`} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white/90">{r?.from?.name || "Student"}</div>
                            <div className="text-xs font-semibold text-white/50">
                              Requesting: {String(r?.kind || "").toUpperCase()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => grantMedia(r?.from?.id, r?.kind, true)}
                              aria-label="Allow"
                            >
                              Allow
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => grantMedia(r?.from?.id, r?.kind, false)}
                              aria-label="Deny"
                            >
                              Deny
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {incomingMediaRequests.length > 8 && (
                      <div className="mt-2 text-xs text-white/50">Showing latest 8 requests.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat messages - Scrollable (only comments, no polls/resources) */}
              <div
                ref={chatScrollRef}
                className="flex-1 min-h-0 overflow-y-auto px-4 pt-4"
                onScroll={onChatScroll}
                onClick={() => setMentionAlerts(0)}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <style>{`
                  .chat-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {messages.filter((m) => {
                  const normalized = normalizeMessage(m);
                  return normalized.type === "comment";
                }).length === 0 ? (
                  <div className="text-sm text-white/60">No messages yet.</div>
                ) : (
                  <div className="space-y-2 chat-scroll">
                    {messages
                      .filter((m) => {
                        const normalized = normalizeMessage(m);
                        return normalized.type === "comment";
                      })
                      .map((m, idx) => (
                        <div key={`${m.ts}_${idx}`} className="text-sm">
                          {renderChatMessage(m, { variant: "meeting" })}
                        </div>
                      ))}
                    <div ref={chatBottomRef} />
                  </div>
                )}
              </div>

              {/* Jump to latest button - Sticky */}
              {!chatStickToBottom && (
                <div className="flex-shrink-0 px-4 pb-2">
                  <button
                    type="button"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                    onClick={() => {
                      chatStickToBottomRef.current = true;
                      setChatStickToBottom(true);
                      chatBottomRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
                    }}
                  >
                    Jump to latest
                  </button>
                </div>
              )}

              {/* Chat input - Sticky */}
              <div className="flex-shrink-0 border-t border-white/10 p-4">
              <div className="flex items-center gap-2 pb-2">
                <label className="text-xs font-semibold text-white/60" htmlFor="chatToMeeting">
                  To
                </label>
                <select
                  id="chatToMeeting"
                  value={chatTo}
                  onChange={(e) => setChatTo(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-white/30"
                  aria-label="Send chat to"
                >
                  <option value="everyone">Everyone</option>
                  {isTutor && <option value="tutors">Tutors only</option>}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="relative w-full">
                  <input
                    value={chatInput}
                    onChange={(e) => {
                      const next = e.target.value;
                      setChatInput(next);
                      const at = next.lastIndexOf("@");
                      if (at >= 0) {
                        const after = next.slice(at + 1);
                        if (!after.includes(" ") && after.length <= 40) {
                          setMentionOpen(true);
                          setMentionQuery(after);
                          return;
                        }
                      }
                      setMentionOpen(false);
                      setMentionQuery("");
                    }}
                    onKeyDown={(e) => (e.key === "Enter" ? sendChat() : null)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    placeholder="Type a message…"
                    aria-label="Chat message"
                  />

                  {mentionOpen && mentionCandidates.length > 0 && (
                    <div className="absolute bottom-[46px] left-0 z-10 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b0f1a] shadow-lg">
                      {mentionCandidates.map((p) => (
                        <button
                          key={p.socketId || p.id}
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/5"
                          onClick={() => {
                            const at = chatInput.lastIndexOf("@");
                            const prefix = at >= 0 ? chatInput.slice(0, at) : chatInput;
                            const insert = `@${p.name} `;
                            setChatInput(prefix + insert);
                            setMentionOpen(false);
                            setMentionQuery("");
                          }}
                        >
                          <span className="font-semibold text-white/90">{p.name}</span>
                          <span className="text-xs text-white/50">{p.role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={sendChat} aria-label="Send message">Send</Button>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom control bar */}
        <div className="flex-shrink-0 border-t border-white/10 bg-black/50 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1500px] items-center justify-center gap-2 px-4 py-3 overflow-x-auto">
            {isTutor ? (
              <>
                <Button
                  className="gap-2"
                  variant={cameraStreamRef.current ? "primary" : "secondary"}
                  onClick={toggleCamera}
                  disabled={!controlsEnabled}
                  aria-pressed={!!cameraStreamRef.current}
                  aria-label={cameraStreamRef.current ? "Turn camera off" : "Turn camera on"}
                >
                  <Camera className="h-4 w-4" />
                  {cameraStreamRef.current ? "Camera On" : "Camera Off"}
                </Button>
                <Button
                  variant={screenStreamRef.current ? "primary" : "secondary"}
                  className="gap-2"
                  onClick={toggleScreenShare}
                  disabled={!controlsEnabled}
                  aria-pressed={!!screenStreamRef.current}
                  aria-label={screenStreamRef.current ? "Stop screen sharing" : "Start screen sharing"}
                >
                  <Monitor className="h-4 w-4" />
                  {screenStreamRef.current ? "Sharing" : "Share"}
                </Button>
                <Button variant="secondary" className="gap-2" onClick={toggleMic} disabled={!controlsEnabled}>
                  {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {micMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant={isRecording ? "primary" : "secondary"}
                  className="gap-2"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={savingRecording}
                >
                  <span className={`h-2 w-2 rounded-full ${isRecording ? "animate-pulse bg-rose-500" : "bg-violet-500"}`} />
                  {isRecording ? "Stop REC" : "REC"}
                </Button>
                <Button variant="secondary" className="gap-2" onClick={stopAllBroadcast}>
                  <StopCircle className="h-4 w-4" />
                  Stop
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={myMediaPerms.micAllowed ? (studentMicOn ? "primary" : "secondary") : "secondary"}
                  className="gap-2"
                  onClick={toggleStudentMic}
                  disabled={!myMediaPerms.micAllowed && myMediaPerms.micRequested}
                  aria-pressed={studentMicOn}
                  aria-label={myMediaPerms.micAllowed ? (studentMicOn ? "Turn mic off" : "Turn mic on") : "Request mic access"}
                  title={myMediaPerms.micAllowed ? "" : "Request tutor approval to use mic"}
                >
                  {studentMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {myMediaPerms.micAllowed ? (studentMicOn ? "Mic On" : "Mic Off") : (myMediaPerms.micRequested ? "Mic Requested" : "Request Mic")}
                </Button>
                <Button
                  variant={myMediaPerms.camAllowed ? (studentCamOn ? "primary" : "secondary") : "secondary"}
                  className="gap-2"
                  onClick={toggleStudentCam}
                  disabled={!myMediaPerms.camAllowed && myMediaPerms.camRequested}
                  aria-pressed={studentCamOn}
                  aria-label={myMediaPerms.camAllowed ? (studentCamOn ? "Turn camera off" : "Turn camera on") : "Request camera access"}
                  title={myMediaPerms.camAllowed ? "" : "Request tutor approval to use camera"}
                >
                  <Camera className="h-4 w-4" />
                  {myMediaPerms.camAllowed ? (studentCamOn ? "Cam On" : "Cam Off") : (myMediaPerms.camRequested ? "Cam Requested" : "Request Cam")}
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={toggleSpeaker}
                  aria-pressed={!speakerMuted}
                  aria-label={speakerMuted ? "Turn speaker on" : "Turn speaker off"}
                >
                  {speakerMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {speakerMuted ? "Speaker On" : "Speaker Off"}
                </Button>
                <Button
                  variant={handRaised ? "primary" : "secondary"}
                  className="gap-2"
                  onClick={toggleHand}
                  aria-pressed={handRaised}
                  aria-label={handRaised ? "Lower hand" : "Raise hand"}
                >
                  <Hand className="h-4 w-4" />
                  {handRaised ? "Hand Raised" : "Raise Hand"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {/* Learner Poll Popup */}
      {!isTutor && pollPopupOpen && activePoll && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-brintelli-border bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-textMuted">Poll</div>
                <div className="mt-1 text-lg font-semibold text-text">{activePoll.question}</div>
              </div>
              <Button variant="secondary" onClick={() => setPollPopupOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {activePoll.options?.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                  onClick={() => {
                    vote(activePoll.id, idx);
                    toast.success("Answer submitted");
                    setPollPopupOpen(false);
                  }}
                >
                  <span className="font-semibold text-textSoft">{opt}</span>
                  <span className="text-xs font-semibold text-textMuted">{activePoll.counts?.[idx] ?? 0}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 text-xs text-textMuted">
              Answer now — your response is recorded instantly.
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title={session?.name ? `Live: ${session.name}` : "Live Session"}
        description="Chat, resources, polls, and screen sharing — all in one room."
        actions={
          <div className="flex gap-2">
            {isTutor && (
              <>
                <Button variant="secondary" className="gap-2" onClick={startSession}>
                  <Play className="h-4 w-4" />
                  Start
                </Button>
                <Button variant="secondary" className="gap-2" onClick={endSession}>
                  <StopCircle className="h-4 w-4" />
                  End
                </Button>
                <Button
                  variant={isRecording ? "primary" : "secondary"}
                  className="gap-2"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={savingRecording}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  <span className={`h-2 w-2 rounded-full ${isRecording ? "animate-pulse bg-rose-500" : "bg-violet-500"}`} />
                  {isRecording ? "Stop REC" : "Start REC"}
                </Button>
              </>
            )}
            <Button variant="secondary" className="gap-2" onClick={copyLink}>
              <LinkIcon className="h-4 w-4" />
              Copy Join Link
            </Button>
            <Button variant="secondary" className="gap-2" onClick={openMeeting}>
              <ExternalLink className="h-4 w-4" />
              Open Meeting Link
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Learner Poll Popup - inside main layout */}
        {!isTutor && pollPopupOpen && activePoll && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-brintelli-border bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-textMuted">Poll</div>
                  <div className="mt-1 text-lg font-semibold text-text">{activePoll.question}</div>
                </div>
                <Button variant="secondary" onClick={() => setPollPopupOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {activePoll.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                    onClick={() => {
                      vote(activePoll.id, idx);
                      toast.success("Answer submitted");
                      setPollPopupOpen(false);
                    }}
                  >
                    <span className="font-semibold text-textSoft">{opt}</span>
                    <span className="text-xs font-semibold text-textMuted">{activePoll.counts?.[idx] ?? 0}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 text-xs text-textMuted">
                Answer now — your response is recorded instantly.
              </div>
            </div>
          </div>
        )}
        {/* LEFT: Studio */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text">
                <Monitor className="h-4 w-4 text-brand-600" />
                Studio
                {isLive && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/60">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                    LIVE
                  </span>
                )}
                {hasRecordingPublished && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200/60">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    REC
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {isTutor ? (
                  <>
                    <Button
                      className="gap-2"
                      variant={cameraStreamRef.current ? "primary" : "secondary"}
                      onClick={toggleCamera}
                      disabled={!controlsEnabled}
                      title={cameraStreamRef.current ? "Stop camera" : "Start camera"}
                    >
                      <Camera className="h-4 w-4" />
                      {cameraStreamRef.current ? "Stop Camera" : "Camera"}
                    </Button>
                    <Button
                      variant={screenStreamRef.current ? "primary" : "secondary"}
                      className="gap-2"
                      onClick={toggleScreenShare}
                      disabled={!controlsEnabled}
                      title={screenStreamRef.current ? "Stop screen sharing" : "Start screen sharing"}
                    >
                      <Monitor className="h-4 w-4" />
                      {screenStreamRef.current ? "Stop Share" : "Share Screen"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={toggleMic}
                      disabled={!controlsEnabled}
                      title={micMuted ? "Unmute microphone" : "Mute microphone"}
                    >
                      {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {micMuted ? "Unmute" : "Mute"}
                    </Button>
                    <Button variant="secondary" className="gap-2" onClick={stopAllBroadcast}>
                      <StopCircle className="h-4 w-4" />
                      Stop
                    </Button>
                  </>
                ) : (
                  <>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={toggleSpeaker}
                    title={speakerMuted ? "Unmute speaker" : "Mute speaker"}
                  >
                    {speakerMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {speakerMuted ? "Speaker On" : "Speaker Off"}
                  </Button>
                    <Button
                      variant={handRaised ? "primary" : "secondary"}
                      className="gap-2"
                      onClick={toggleHand}
                      title={handRaised ? "Lower hand" : "Raise hand"}
                    >
                      <Hand className="h-4 w-4" />
                      {handRaised ? "Hand Raised" : "Raise Hand"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Video stage: screen (main) + camera PiP */}
            <div className="mt-4 relative overflow-hidden rounded-2xl border border-brintelli-border bg-black">
              <video
                ref={isTutor ? screenPreviewRef : remoteScreenRef}
                autoPlay
                playsInline
                muted={isTutor || speakerMuted}
                className="h-[420px] w-full object-contain bg-black"
              />

              {/* Camera PiP */}
              <div className="absolute bottom-3 right-3 w-[240px] overflow-hidden rounded-xl border border-white/20 bg-black shadow-lg">
                <video
                  ref={isTutor ? cameraPreviewRef : remoteCameraRef}
                  autoPlay
                  playsInline
                  muted={isTutor || speakerMuted}
                  className="h-[135px] w-full object-cover bg-black"
                />
              </div>
            </div>
          </div>

          {/* Bottom utility area: Recording fallback + Resources + Polls (kept for now, will be tightened next) */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recording storage */}
            {isTutor && (
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft lg:col-span-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-text">
                    <Video className="h-4 w-4 text-brand-600" />
                    Recording & Storage
                  </div>
                  {(recordingUrlLocal || sessionRecordings.length > 0) && (
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={() => window.open((recordingUrlLocal || sessionRecordings?.[sessionRecordings.length - 1]?.url), "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open latest recording
                    </Button>
                  )}
                </div>
                {sessionRecordings.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {sessionRecordings
                      .slice()
                      .reverse()
                      .slice(0, 6)
                      .map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="flex items-center justify-between rounded-xl border border-brintelli-border bg-white px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                          onClick={() => r?.url && window.open(r.url, "_blank", "noopener,noreferrer")}
                        >
                          <span className="truncate font-semibold text-text">Recording</span>
                          <span className="text-xs text-textMuted">
                            {r?.ts ? new Date(r.ts).toLocaleString() : ""}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-textMuted">
                  Use <b>Start REC</b> in the header to record + upload automatically. You can also paste a URL as a fallback.
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                    className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                    placeholder="Fallback: paste recording URL (Drive/YouTube/S3)…"
                  />
                  <Button onClick={publishRecording} disabled={savingRecording}>
                    Publish URL
                  </Button>
                </div>
              </div>
            )}

            {/* Resources (tutor/admin only) */}
            {canModerate && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-text">
                  <LinkIcon className="h-4 w-4 text-brand-600" />
                  Resources
                </div>
                  <Button variant="secondary" onClick={() => setShowResourceComposer((v) => !v)}>
                    {showResourceComposer ? "Close" : "Add"}
                  </Button>
              </div>
                {showResourceComposer && (
                <div className="mt-3 space-y-2">
                  <input
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                    placeholder="Title (optional)"
                  />
                  <div className="flex gap-2">
                    <input
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                      placeholder="Paste resource link…"
                    />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          shareResource();
                          setShowResourceComposer(false);
                        }}
                      >
                      Share
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2">
                {resources.length === 0 ? (
                  <div className="text-sm text-textMuted">No resources shared yet.</div>
                ) : (
                  resources.map((r) => (
                    <button
                      key={r.id}
                      className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-left text-sm text-textSoft hover:bg-brintelli-baseAlt"
                      onClick={() => window.open(r.url, "_blank", "noopener,noreferrer")}
                    >
                      <div className="font-semibold text-text">{r.title}</div>
                      <div className="text-xs text-textMuted">{r.url}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
            )}

            {/* Polls (tutor/admin only) */}
            {canModerate && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-text">
                  <BarChart3 className="h-4 w-4 text-brand-600" />
                  Polls
                </div>
                  <Button variant="secondary" onClick={() => setShowPollComposer((v) => !v)}>
                    {showPollComposer ? "Close" : "Create"}
                  </Button>
              </div>

              {showPollComposer && (
                <div className="mt-3 space-y-2">
                  <input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                    placeholder="Poll question…"
                  />
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[idx] = e.target.value;
                        setPollOptions(next);
                      }}
                      className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setPollOptions((p) => (p.length < 10 ? [...p, ""] : p))}
                    >
                      Add option
                    </Button>
                    <Button onClick={createPoll}>Create poll</Button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {polls.length === 0 ? (
                  <div className="text-sm text-textMuted">No polls yet.</div>
                ) : (
                  polls.map((p) => (
                    <div key={p.id} className="rounded-xl border border-brintelli-border bg-white p-3">
                      <div className="font-semibold text-text">{p.question}</div>
                      <div className="mt-2 space-y-2">
                        {p.options?.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => vote(p.id, idx)}
                            className="flex w-full items-center justify-between rounded-lg border border-brintelli-border px-3 py-2 text-left text-sm text-textSoft hover:bg-brintelli-baseAlt"
                          >
                            <span>{opt}</span>
                            <span className="text-xs font-semibold text-textMuted">
                              {p.counts?.[idx] ?? 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}

            {/* Students (tutor only) */}
            {isTutor && (
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-text">
                    <Users className="h-4 w-4 text-brand-600" />
                    Students
                  </div>
                  <div className="text-xs font-semibold text-textMuted">
                    {enrolledStudents.length > 0 ? `${enrolledStudents.length} enrolled` : "—"}
                  </div>
                </div>
                <div className="mt-2 text-xs text-textMuted">
                  {enrolledBatch?.name ? <>Batch: <b>{enrolledBatch.name}</b></> : "Enrolled list available for tutors"}
                </div>
                <div className="mt-4 max-h-[280px] overflow-auto rounded-xl border border-brintelli-border bg-white p-3">
                  {isTutor && enrolledStudents.length === 0 ? (
                    <div className="text-sm text-textMuted">No enrolled students found (or batch not assigned).</div>
                  ) : (
                    <div className="space-y-2">
                      {enrolledStudents.map((s) => {
                        const isOnline = participants.some((p) => (p.role === "student" || p.role === "learner") && (p.name === s.name || p.id === s.id));
                        return (
                          <div
                            key={s.id}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                              isOnline ? "border-emerald-200 bg-emerald-50/40" : "border-brintelli-border bg-white"
                            }`}
                          >
                            <div className="font-semibold text-text">{s.name || "Student"}</div>
                            <div className="text-xs font-semibold text-textMuted">{isOnline ? "Attending" : "Offline"}</div>
                          </div>
                        );
                      })}
                      {!isTutor && (
                        participants
                          .filter((p) => p.role === "student" || p.role === "learner")
                          .map((p) => (
                            <div key={p.socketId} className="flex items-center justify-between rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm">
                              <div className="font-semibold text-text">{p.name || "Student"}</div>
                              <div className="text-xs font-semibold text-textMuted">Attending</div>
                            </div>
                          ))
                      )}
                      {isTutor && participants.length > 0 && (
                        <>
                          <div className="mt-3 border-t border-brintelli-border/60 pt-3 text-xs font-semibold text-textMuted">
                            Online in this session (click to @mention)
                          </div>
                          {participants.map((p) => (
                            <button
                              key={`online_${p.socketId || p.id}`}
                              type="button"
                              className="flex w-full items-center justify-between rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm hover:bg-brintelli-baseAlt"
                              onClick={() => setChatInput((prev) => (prev ? `${prev} @${p.name} ` : `@${p.name} `))}
                            >
                              <div className="font-semibold text-text">{p.name || "User"}</div>
                              <div className="text-xs font-semibold text-textMuted">{p.role}</div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Full-height Comments */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-text">
              <MessageSquare className="h-4 w-4 text-brand-600" />
              Comments
              {mentionAlerts > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200/60">
                  {mentionAlerts} mention{mentionAlerts > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-textMuted">
              <Users className="h-4 w-4" />
                {isTutor ? (
                  <button
                    type="button"
                    className="underline underline-offset-2 hover:text-text"
                    onClick={() => setShowParticipantsPanel((v) => !v)}
                    title="Show participants"
                  >
              {participants.length} online
                  </button>
                ) : (
                  <span>{participants.length} online</span>
                )}
            </div>
          </div>

          {isTutor && showParticipantsPanel && (
            <div className="mt-3 rounded-xl border border-brintelli-border bg-white p-3">
              {participants.length === 0 ? (
                <div className="text-sm text-textMuted">No one is in the room yet.</div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {participants.map((p) => (
                    <button
                      key={p.socketId || p.id}
                      type="button"
                      className="flex items-center justify-between rounded-lg border border-brintelli-border px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                      onClick={() => {
                        setChatInput((prev) => (prev ? `${prev} @${p.name} ` : `@${p.name} `));
                      }}
                      title="Click to @mention"
                    >
                      <span className="font-semibold text-text">
                        {p.name || "User"} {p.handRaised ? <span className="ml-1">✋</span> : null}
                      </span>
                      <span className="text-xs font-semibold text-textMuted">{p.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div
            ref={chatScrollRef}
            className="mt-4 flex-1 overflow-auto rounded-xl border border-brintelli-border bg-white p-3"
            onScroll={onChatScroll}
            onClick={() => setMentionAlerts(0)}
          >
            {messages.length === 0 ? (
              <div className="text-sm text-textMuted">No messages yet.</div>
            ) : (
              <div className="space-y-2">
                {messages.map((m, idx) => (
                  <div key={`${m.ts}_${idx}`} className="text-sm">
                    {renderChatMessage(m, { variant: "classic" })}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <div className="relative w-full">
            <input
              value={chatInput}
                onChange={(e) => {
                  const next = e.target.value;
                  setChatInput(next);
                  const at = next.lastIndexOf("@");
                  if (at >= 0) {
                    const after = next.slice(at + 1);
                    // Only open mention picker if "@<letters>" is the current token
                    if (!after.includes(" ") && after.length <= 40) {
                      setMentionOpen(true);
                      setMentionQuery(after);
                      return;
                    }
                  }
                  setMentionOpen(false);
                  setMentionQuery("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendChat();
                    return;
                  }
                  if (e.key === "Escape") {
                    setMentionOpen(false);
                    setMentionQuery("");
                  }
                }}
              className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                placeholder="Ask doubts / leave comments… (type @ to mention)"
              />

              {mentionOpen && mentionCandidates.length > 0 && (
                <div className="absolute bottom-[46px] left-0 z-10 w-full overflow-hidden rounded-xl border border-brintelli-border bg-white shadow-lg">
                  {mentionCandidates.map((p) => (
                    <button
                      key={p.socketId || p.id}
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                      onClick={() => {
                        const at = chatInput.lastIndexOf("@");
                        const prefix = at >= 0 ? chatInput.slice(0, at) : chatInput;
                        const insert = `@${p.name} `;
                        setChatInput(prefix + insert);
                        setMentionOpen(false);
                        setMentionQuery("");
                      }}
                    >
                      <span className="font-semibold text-text">{p.name}</span>
                      <span className="text-xs text-textMuted">{p.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </div>
    </>
  );
}


