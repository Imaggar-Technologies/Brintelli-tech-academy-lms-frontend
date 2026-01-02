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
  Trophy,
  Settings,
  ArrowLeft,
  ChevronLeft,
  Bookmark,
  FileText,
  Bell,
  X,
  Plus,
  Image as ImageIcon,
  File,
  Upload,
} from "lucide-react";
import PageHeader from "../PageHeader";
import Button from "../Button";
import { getSocket } from "../../utils/socketClient";
import { selectCurrentUser, selectToken } from "../../store/slices/authSlice";
import tutorAPI from "../../api/tutor";
import sessionAPI from "../../api/session";
import { uploadAPI } from "../../api/upload";

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function SessionRoom({ sessionId, session, uiVariant = "classic", mode = "studio" }) {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);

  const role = user?.role;
  const isTutor = role === "tutor";
  const canModerate = ["tutor", "admin", "lsm", "programManager", "program-manager"].includes(role);
  const canCreateContent = ["tutor", "admin", "lsm", "programManager", "program-manager"].includes(role);

  const socket = useMemo(() => (token ? getSocket(token) : null), [token]);

  const [participants, setParticipants] = useState([]);
  const [participantMediaPerms, setParticipantMediaPerms] = useState({}); // { userId: { camAllowed, micAllowed } }
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  // Debug: Log quizzes when they change
  useEffect(() => {
    console.log('[SessionRoom] Quizzes state updated:', quizzes.length, quizzes);
  }, [quizzes]);
  const [sessionRecordings, setSessionRecordings] = useState([]);
  const [mentionAlerts, setMentionAlerts] = useState(0);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [quizPopupOpen, setQuizPopupOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const quizDialogTitleId = useMemo(() => `quiz_dialog_title_${sessionId}`, [sessionId]);
  const firstQuizOptionRef = useRef(null);
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

  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", ""]);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState(null); // index of correct answer (single)
  const [quizCorrectAnswers, setQuizCorrectAnswers] = useState([]); // array of correct answer indices (multiple)
  const [quizIsMultipleChoice, setQuizIsMultipleChoice] = useState(false); // allow multiple answers
  const [quizIsScored, setQuizIsScored] = useState(true); // true = scored quiz, false = poll (no score)
  const [quizDraft, setQuizDraft] = useState(null); // draft quiz before publishing
  const [leaderboard, setLeaderboard] = useState([]); // [{userId, name, score}]
  const [showLeftSidebar, setShowLeftSidebar] = useState(true); // for tutors
  const [leftSidebarTab, setLeftSidebarTab] = useState("students"); // "students" | "quizzes" | "leaderboard"
  
  // New state for Scaler-style UI
  const [rightSidebarTab, setRightSidebarTab] = useState("chat"); // "chat" | "bookmarks" | "notes" | "notice" | "quizzes" | "leaderboard"
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkNotes, setBookmarkNotes] = useState("");
  const [notices, setNotices] = useState([]);
  const [sessionResources, setSessionResources] = useState([]);
  const [lectureNotes, setLectureNotes] = useState([]);
  
  // Notice board form state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDescription, setNoticeDescription] = useState("");
  const [noticeUrl, setNoticeUrl] = useState("");
  const [noticeFile, setNoticeFile] = useState(null);
  const [noticeUploading, setNoticeUploading] = useState(false);
  
  // Lecture notes form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [noteUrl, setNoteUrl] = useState("");
  const [noteFile, setNoteFile] = useState(null);
  const [noteUploading, setNoteUploading] = useState(false);
  const [selectedQuizTab, setSelectedQuizTab] = useState("all"); // "all" | quizId
  const [showQuizLaunchModal, setShowQuizLaunchModal] = useState(false);
  const [quizToLaunch, setQuizToLaunch] = useState(null);
  
  // Quiz creation state
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizTimestamp, setNewQuizTimestamp] = useState("");

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
  const [showQuizComposer, setShowQuizComposer] = useState(false);
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

  // Better accessibility for quiz popup (focus + escape)
  useEffect(() => {
    if (!quizPopupOpen) return;
    const t = setTimeout(() => firstQuizOptionRef.current?.focus?.(), 0);
    const onKey = (e) => {
      if (e.key === "Escape") setQuizPopupOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [quizPopupOpen]);

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
    if (msg.startsWith("[QUIZ RESULT]")) return { ...m, type: "quiz-results" };
    if (msg.startsWith("[QUIZ ANSWER]")) return { ...m, type: "quiz-answer" };
    if (msg.startsWith("[QUIZ]")) return { ...m, type: "quiz" };
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

    if (m.type === "quiz") {
      const q = quizzes.find((x) => x?.id === m.quizId) || m.quiz || null;
      const question = q?.question || (m.message || "").replace("[QUIZ]", "").trim() || "Quiz";
      return (
        <div className="space-y-1">
          <div className={`text-xs ${mutedTextColor}`}>
            <span className="font-semibold">{name}</span> {roleLabel} {time ? `• ${time}` : ""}
          </div>
          <div className={`rounded-xl border ${cardBorder} p-3`}>
            <div className={`flex items-center gap-2 text-sm font-semibold ${variant === "meeting" ? "text-white/90" : "text-text"}`}>
              <BarChart3 className="h-4 w-4" />
              Quiz
            </div>
            <div className={`mt-2 text-sm font-semibold ${baseTextColor}`}>{question}</div>
            {!isTutor && (
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (q) {
                      setActiveQuiz(q);
                      setQuizPopupOpen(true);
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

    if (m.type === "quiz-answer") {
      const optionText = m.optionText || String(m.message || "").trim();
      const q = quizzes.find((x) => x?.id === m.quizId) || m.quiz || null;
      const question = q?.question || "";
      return (
        <div className="space-y-1">
          <div className={`text-xs ${mutedTextColor}`}>
            <span className="font-semibold">{name}</span> {roleLabel} {time ? `• ${time}` : ""}
          </div>
          <div className={`rounded-xl border ${cardBorder} p-3`}>
            {question ? <div className={`text-xs ${mutedTextColor}`}>Quiz: {question}</div> : null}
            <div className={`mt-1 text-sm ${baseTextColor}`}>
              <span className="font-semibold">Answered:</span> {optionText}
            </div>
          </div>
        </div>
      );
    }

    if (m.type === "quiz-results") {
      const q = quizzes.find((x) => x?.id === m.quizId) || m.quiz || null;
      const question = q?.question || (m.message || "").replace("[QUIZ RESULT]", "").split("—")[0].trim();
      const options = q?.options || [];
      const counts = q?.counts || [];
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
    // Close existing PCs and recreate (most reliable when adding/removing tracks)
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
      const rawParticipants = payload.participants || [];
      
      // Update leaderboard with participant names
      setLeaderboard((prev) => {
        return prev.map((entry) => {
          const participant = rawParticipants.find(
            (p) => String(p?.id || p?._id || p?.userId || "") === String(entry.userId)
          );
          if (participant) {
            return {
              ...entry,
              name: participant.name || entry.name,
              email: participant.email || entry.email,
            };
          }
          return entry;
        });
      });
      
      // Deduplicate by userId/id and email, keeping the most recent socketId
      const seen = new Map();
      const deduplicated = [];
      for (const p of rawParticipants) {
        const key = p.id || p.userId || p.email || p.socketId;
        if (!key) {
          // If no unique identifier, keep by socketId
          if (!seen.has(p.socketId)) {
            seen.set(p.socketId, p);
            deduplicated.push(p);
          }
          continue;
        }
        if (!seen.has(key)) {
          seen.set(key, p);
          deduplicated.push(p);
        } else {
          // Update with most recent socketId if different
          const existing = seen.get(key);
          if (p.socketId && p.socketId !== existing.socketId) {
            const updated = { ...existing, socketId: p.socketId };
            const idx = deduplicated.findIndex((dp) => (dp.id || dp.userId || dp.email || dp.socketId) === key);
            if (idx >= 0) {
              deduplicated[idx] = updated;
              seen.set(key, updated);
            }
          }
        }
      }
      setParticipants(deduplicated);
    };
    const onChat = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setMessages((prev) => [...prev, payload].slice(-200));
    };

    const onSessionSnapshot = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      const timeline = payload?.timeline || [];
      const snapshotQuizzes = payload?.quizzes || [];
      const snapshotRecs = payload?.recordings || [];
      const snapshotLeaderboard = payload?.leaderboard || {};
      
      // Prefer enrichedLeaderboard if available (has user names)
      if (payload?.enrichedLeaderboard && typeof payload.enrichedLeaderboard === 'object' && Object.keys(payload.enrichedLeaderboard).length > 0) {
        const leaderboardArray = Object.entries(payload.enrichedLeaderboard)
          .filter(([userId, data]) => userId && (Number(data?.score) || 0) > 0)
          .map(([userId, data]) => ({
            userId,
            name: data.name || "Unknown",
            email: data.email || "",
            score: Number(data.score) || 0,
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        console.log('[SessionRoom] Session snapshot - leaderboard (enriched):', leaderboardArray.length, 'entries', leaderboardArray);
        setLeaderboard(leaderboardArray);
      } else if (snapshotLeaderboard && typeof snapshotLeaderboard === 'object' && Object.keys(snapshotLeaderboard).length > 0) {
        // Fallback to simple leaderboard format
        const leaderboardArray = Object.entries(snapshotLeaderboard)
          .filter(([userId, score]) => userId && (Number(score) || 0) > 0) // Only include entries with valid userId and score > 0
          .map(([userId, score]) => {
            // Try to find participant info
            const participant = (payload?.participants || []).find(
              (p) => String(p?.id || p?._id || p?.userId || "") === String(userId)
            );
            return {
              userId,
              name: participant?.name || "Unknown",
              email: participant?.email || "",
              score: Number(score) || 0,
            };
          });
        // Sort by score descending
        leaderboardArray.sort((a, b) => (b.score || 0) - (a.score || 0));
        console.log('[SessionRoom] Session snapshot - leaderboard:', leaderboardArray.length, 'entries', leaderboardArray);
        setLeaderboard(leaderboardArray);
      } else {
        // Initialize empty leaderboard if none exists
        console.log('[SessionRoom] No leaderboard data in snapshot, initializing empty');
        setLeaderboard([]);
      }

      // Render timeline into the Comments feed so students see resources/quizzes history too.
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
        if (ev?.type === "quiz") {
          const quiz = (snapshotQuizzes || []).find((q) => q?.id === ev.quizId);
          return {
            sessionId,
            ts: ev.ts,
            user: ev.user,
            message: `[QUIZ] ${quiz?.question || "Quiz created"}`,
            quizId: ev.quizId,
            type: "quiz",
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
      const quizList = Array.isArray(snapshotQuizzes) ? snapshotQuizzes.filter(q => q && q.id) : [];
      console.log('[SessionRoom] Session snapshot - quizzes:', quizList.length, quizList);
      // Set all quizzes from snapshot (including drafts)
      setQuizzes(quizList);
      setSessionRecordings(snapshotRecs);

      // Learner: show latest unanswered quiz as a popup
      if (!isTutor && snapshotQuizzes.length > 0) {
        const uid = String(user?.id || user?._id || "");
        const latest = snapshotQuizzes[snapshotQuizzes.length - 1];
        const answered = !!(uid && latest?.votes && latest.votes[uid] !== undefined);
        if (!answered) {
          setActiveQuiz(latest);
          setQuizPopupOpen(true);
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
    const onQuizSnapshot = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      const quizList = Array.isArray(payload.quizzes) ? payload.quizzes.filter(q => q && q.id) : [];
      console.log('[SessionRoom] Quiz snapshot received:', quizList.length, 'quizzes', quizList);
      // Set all quizzes (including drafts)
      setQuizzes(quizList);
    };
    const onQuizNew = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.quiz) {
        setQuizzes((prev) => [payload.quiz, ...prev]);
        // Also show in Comments feed
        setMessages((prev) =>
          [
            ...prev,
            {
              sessionId,
              ts: payload.quiz.ts,
              user: payload.quiz.createdBy,
              message: `[QUIZ] ${payload.quiz.question}`,
              quizId: payload.quiz.id,
              type: "quiz",
            },
          ].slice(-200)
        );

        // Learner: pop up quiz immediately
        if (!isTutor) {
          setActiveQuiz(payload.quiz);
          setQuizPopupOpen(true);
        }
      }
    };
    const onQuizUpdate = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (!payload?.quiz) return;
      setQuizzes((prev) => prev.map((q) => (q.id === payload.quiz.id ? payload.quiz : q)));
      if (activeQuiz?.id === payload.quiz.id) setActiveQuiz(payload.quiz);

      // Upsert a "results" line into Comments
      const quiz = payload.quiz;
      setMessages((prev) => {
        const next = (prev || []).filter((m) => !(m?.type === "quiz-results" && m?.quizId === quiz.id));
        return [
          ...next,
          {
            sessionId,
            ts: new Date().toISOString(),
            user: { name: "System", role: "system" },
            message: quiz.question,
            quizId: quiz.id,
            type: "quiz-results",
            quiz,
          },
        ].slice(-200);
      });
    };

    const onQuizAnswer = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setMessages((prev) =>
        [
          ...prev,
          {
            sessionId,
            ts: payload?.ts || new Date().toISOString(),
            user: payload?.user,
            message: payload?.optionText || `Option ${Number(payload?.optionIndex ?? 0) + 1}`,
            quizId: payload?.quizId,
            type: "quiz-answer",
            optionIndex: payload?.optionIndex,
            optionText: payload?.optionText,
            quiz: payload?.quiz
          },
        ].slice(-200)
      );
    };

    const onQuizDraft = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.quiz && payload.quiz.id) {
        console.log('[SessionRoom] Quiz draft received:', payload.quiz);
        setQuizzes((prev) => {
          const existing = prev.find((q) => q && q.id === payload.quiz.id);
          if (existing) {
            const updated = prev.map((q) => (q && q.id === payload.quiz.id ? payload.quiz : q)).filter(Boolean);
            console.log('[SessionRoom] Updated existing quiz, total:', updated.length);
            return updated;
          }
          // Add new quiz to the list
          const updated = [payload.quiz, ...prev].filter(Boolean);
          console.log('[SessionRoom] Added new quiz, total:', updated.length);
          return updated;
        });
      }
    };

    const onQuizPublished = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.quiz) {
        setQuizzes((prev) => prev.map((q) => (q.id === payload.quiz.id ? payload.quiz : q)));
        // Show quiz to students
        if (!isTutor) {
          setActiveQuiz(payload.quiz);
          setQuizPopupOpen(true);
          playNotificationSound();
        }
        // Add to timeline
        setMessages((prev) =>
          [
            ...prev,
            {
              sessionId,
              ts: payload.quiz.publishedAt || new Date().toISOString(),
              user: payload.quiz.createdBy,
              message: `[QUIZ] ${payload.quiz.question}`,
              quizId: payload.quiz.id,
              type: "quiz",
            },
          ].slice(-200)
        );
      }
    };

    const onQuizCorrectAnswer = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.quiz) {
        setQuizzes((prev) => prev.map((q) => (q.id === payload.quiz.id ? payload.quiz : q)));
      }
      if (payload?.scores) {
        // Update leaderboard from scores
        console.log('[SessionRoom] Quiz correct answer - scores:', payload.scores);
        console.log('[SessionRoom] Quiz correct answer - enrichedScores:', payload.enrichedScores);
        
        // Prefer enrichedScores if available (has user names from vote data)
        if (payload?.enrichedScores && typeof payload.enrichedScores === 'object') {
          setLeaderboard((prev) => {
            const updated = [...prev]; // Create new array
            Object.entries(payload.enrichedScores).forEach(([userId, data]) => {
              const points = Number(data.points || data || 0);
              const existingIdx = updated.findIndex((e) => String(e.userId) === String(userId));
              if (existingIdx >= 0) {
                // Update existing entry
                updated[existingIdx] = {
                  ...updated[existingIdx],
                  score: (updated[existingIdx].score || 0) + points,
                  // Update name if we have better info
                  name: data.name || updated[existingIdx].name || "Unknown",
                  email: data.email || updated[existingIdx].email || "",
                };
              } else {
                // Add new entry with user info from enriched data
                updated.push({
                  userId,
                  name: data.name || "Unknown",
                  email: data.email || "",
                  score: points,
                });
              }
            });
            // Sort by score descending
            updated.sort((a, b) => (b.score || 0) - (a.score || 0));
            console.log('[SessionRoom] Updated leaderboard (enriched):', updated.length, 'entries', updated);
            return updated;
          });
        } else {
          // Fallback to simple scores format
          setLeaderboard((prev) => {
            const updated = [...prev]; // Create new array
            Object.entries(payload.scores).forEach(([userId, points]) => {
              const existingIdx = updated.findIndex((e) => String(e.userId) === String(userId));
              if (existingIdx >= 0) {
                // Update existing entry
                updated[existingIdx] = {
                  ...updated[existingIdx],
                  score: (updated[existingIdx].score || 0) + Number(points),
                };
              } else {
                // Try to get user info from participants first, then fallback to "Unknown"
                const participant = participants.find((p) => String(p?.id || p?._id || p?.userId || "") === String(userId));
                updated.push({
                  userId,
                  name: participant?.name || "Unknown",
                  email: participant?.email || "",
                  score: Number(points) || 0,
                });
              }
            });
            // Sort by score descending
            updated.sort((a, b) => (b.score || 0) - (a.score || 0));
            console.log('[SessionRoom] Updated leaderboard:', updated.length, 'entries', updated);
            return updated;
          });
        }
      }
      
      // Also check if enrichedLeaderboard is provided in the payload (from session:leaderboard event)
      if (payload?.enrichedLeaderboard) {
        console.log('[SessionRoom] Quiz correct answer - enriched leaderboard:', payload.enrichedLeaderboard);
        const leaderboardArray = Object.entries(payload.enrichedLeaderboard)
          .map(([userId, data]) => ({
            userId,
            name: data.name || "Unknown",
            email: data.email || "",
            score: Number(data.score) || 0,
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        console.log('[SessionRoom] Setting leaderboard from enriched data:', leaderboardArray);
        setLeaderboard(leaderboardArray);
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
            const userInfo = participants.find((p) => p.socketId === from) || { name: "Student", role: "student" };
            
            // Handle track updates
            const handleTrackUpdate = () => {
              setTutorUplinks((prev) => {
                const exists = (prev || []).some((u) => u.socketId === from);
                if (exists) {
                  return (prev || []).map((u) => (u.socketId === from ? { ...u, stream, user: userInfo } : u));
                }
                return [{ socketId: from, stream, user: userInfo }, ...(prev || [])].slice(0, 8);
              });
            };
            
            // Listen for track changes
            stream.getTracks().forEach((track) => {
              track.onended = () => {
                // Track ended, update state
                handleTrackUpdate();
              };
              track.onmute = () => handleTrackUpdate();
              track.onunmute = () => handleTrackUpdate();
            });
            
            handleTrackUpdate();
          };
          
          // Handle connection state changes
          pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
              setTutorUplinks((prev) => prev.filter((u) => u.socketId !== from));
            }
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
    socket.on("quiz:snapshot", onQuizSnapshot);
    socket.on("quiz:new", onQuizNew);
    socket.on("quiz:draft", onQuizDraft);
    socket.on("quiz:published", onQuizPublished);
    socket.on("quiz:update", onQuizUpdate);
    socket.on("quiz:answer", onQuizAnswer);
    socket.on("quiz:correctAnswer", onQuizCorrectAnswer);
    socket.on("session:snapshot", onSessionSnapshot);
    
    // Listen for leaderboard updates
    // Listen for leaderboard updates
    const onLeaderboardUpdate = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      
      // Prefer enrichedLeaderboard if available (has user names)
      if (payload?.enrichedLeaderboard && typeof payload.enrichedLeaderboard === 'object') {
        const leaderboardArray = Object.entries(payload.enrichedLeaderboard)
          .filter(([userId, data]) => userId && (Number(data?.score) || 0) > 0)
          .map(([userId, data]) => ({
            userId,
            name: data.name || "Unknown",
            email: data.email || "",
            score: Number(data.score) || 0,
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        console.log('[SessionRoom] Leaderboard updated via socket (enriched):', leaderboardArray.length, 'entries', leaderboardArray);
        setLeaderboard(leaderboardArray);
        return;
      }
      
      // Fallback to simple leaderboard format
      const leaderboardObj = payload?.leaderboard || {};
      if (leaderboardObj && typeof leaderboardObj === 'object' && Object.keys(leaderboardObj).length > 0) {
        const leaderboardArray = Object.entries(leaderboardObj)
          .filter(([userId, score]) => userId && (Number(score) || 0) > 0)
          .map(([userId, score]) => {
            const participant = participants.find(
              (p) => String(p?.id || p?._id || p?.userId || "") === String(userId)
            );
            return {
              userId,
              name: participant?.name || "Unknown",
              email: participant?.email || "",
              score: Number(score) || 0,
            };
          });
        // Sort by score descending
        leaderboardArray.sort((a, b) => (b.score || 0) - (a.score || 0));
        console.log('[SessionRoom] Leaderboard updated via socket:', leaderboardArray.length, 'entries', leaderboardArray);
        setLeaderboard(leaderboardArray);
      }
    };
    socket.on("session:leaderboard", onLeaderboardUpdate);
    
    // Listen for bookmark events
    socket.on("bookmark:new", (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.bookmark) {
        setBookmarks((prev) => {
          // Check if bookmark already exists
          const exists = prev.some((b) => (b.id || b._id) === (payload.bookmark.id || payload.bookmark._id));
          if (exists) return prev;
          return [...prev, payload.bookmark].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        });
      }
    });
    
    socket.on("bookmark:deleted", (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.bookmarkId) {
        setBookmarks((prev) => prev.filter((b) => (b.id || b._id) !== payload.bookmarkId));
      }
    });
    
    socket.on("bookmark:error", (payload) => {
      if (payload?.sessionId !== sessionId) return;
      toast.error(payload?.error || "Bookmark error");
    });
    
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
      socket.off("quiz:snapshot", onQuizSnapshot);
      socket.off("quiz:new", onQuizNew);
      socket.off("quiz:draft", onQuizDraft);
      socket.off("quiz:published", onQuizPublished);
      socket.off("quiz:correctAnswer", onQuizCorrectAnswer);
      socket.off("quiz:update", onQuizUpdate);
      socket.off("quiz:answer", onQuizAnswer);
      socket.off("session:snapshot", onSessionSnapshot);
      socket.off("session:leaderboard", onLeaderboardUpdate);
      socket.off("bookmark:new");
      socket.off("bookmark:deleted");
      socket.off("bookmark:error");
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

  // Fetch bookmarks, notices, and resources when sessionId changes
  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        // Fetch all bookmarks for the session (not filtered by userId)
        const bookmarksRes = await sessionAPI.getBookmarks(sessionId);
        if (bookmarksRes.success && bookmarksRes.data?.bookmarks) {
          setBookmarks(bookmarksRes.data.bookmarks);
        }

        // Fetch notices
        const noticesRes = await sessionAPI.getNotices(sessionId);
        if (noticesRes.success && noticesRes.data?.notices) {
          setNotices(noticesRes.data.notices);
        }

        // Fetch resources
        const resourcesRes = await sessionAPI.getResources(sessionId);
        if (resourcesRes.success && resourcesRes.data?.resources) {
          setSessionResources(resourcesRes.data.resources);
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };

    fetchSessionData();
  }, [sessionId, user?.id, user?._id]);

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
    if (!tutorSocketId || !uplinkPcRef.current) {
      toast.error("Tutor not connected");
      return;
    }
    const next = !studentMicOn;
    const pc = uplinkPcRef.current;
    
    try {
      if (next) {
        // Get or create audio stream
        let audioStream;
        if (studentStreamRef.current) {
          const existingAudio = studentStreamRef.current.getAudioTracks();
          if (existingAudio.length > 0) {
            // Reuse existing track
            audioStream = studentStreamRef.current;
          } else {
            // Add audio to existing stream
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const audioTrack = audioStream.getAudioTracks()[0];
            if (audioTrack) {
              studentStreamRef.current.addTrack(audioTrack);
              audioStream.getTracks().forEach(t => t.stop()); // Stop the temporary stream
            }
            audioStream = studentStreamRef.current;
          }
        } else {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          studentStreamRef.current = audioStream;
        }
        
        const audioTrack = audioStream.getAudioTracks()?.[0];
        if (audioTrack) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
          if (sender) {
            await sender.replaceTrack(audioTrack);
          } else {
            // Add new sender if none exists
            pc.addTrack(audioTrack, audioStream);
          }
        }
      } else {
        // Mute: replace with null track
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (sender && sender.track) {
          await sender.replaceTrack(null);
        }
      }
      setStudentMicOn(next);
    } catch (e) {
      console.error("toggleStudentMic error:", e);
      toast.error(e?.message || "Failed to toggle microphone");
    }
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
    if (!tutorSocketId || !uplinkPcRef.current) {
      toast.error("Tutor not connected");
      return;
    }
    const next = !studentCamOn;
    const pc = uplinkPcRef.current;
    
    try {
      if (next) {
        // Get or create video stream
        let videoStream;
        if (studentStreamRef.current) {
          const existingVideo = studentStreamRef.current.getVideoTracks();
          if (existingVideo.length > 0) {
            // Reuse existing track
            videoStream = studentStreamRef.current;
          } else {
            // Add video to existing stream
            videoStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
            const videoTrack = videoStream.getVideoTracks()[0];
            if (videoTrack) {
              studentStreamRef.current.addTrack(videoTrack);
              videoStream.getTracks().forEach(t => t.stop()); // Stop the temporary stream
            }
            videoStream = studentStreamRef.current;
          }
        } else {
          videoStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
          studentStreamRef.current = videoStream;
        }
        
        const videoTrack = videoStream.getVideoTracks()?.[0];
        if (videoTrack) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(videoTrack);
          } else {
            // Add new sender if none exists
            pc.addTrack(videoTrack, videoStream);
          }
        }
      } else {
        // Turn off: replace with null track
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender && sender.track) {
          await sender.replaceTrack(null);
        }
      }
      setStudentCamOn(next);
    } catch (e) {
      console.error("toggleStudentCam error:", e);
      toast.error(e?.message || "Failed to toggle camera");
    }
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

  const createQuiz = () => {
    if (!socket) return;
    const q = quizQuestion.trim();
    const opts = quizOptions.map((o) => o.trim()).filter(Boolean);
    if (!q || opts.length < 2) {
      toast.error("Quiz needs a question + at least 2 options");
      return;
    }
    
    // Support both single and multiple correct answers
    let correctAnswer = undefined;
    let correctAnswers = undefined;
    if (quizIsMultipleChoice && quizCorrectAnswers.length > 0) {
      correctAnswers = quizCorrectAnswers;
    } else if (!quizIsMultipleChoice && quizCorrectAnswer !== null) {
      correctAnswer = quizCorrectAnswer;
    }
    
    socket.emit("quiz:create", {
      sessionId,
      question: q,
      options: opts,
      correctAnswer,
      correctAnswers,
      scored: quizIsScored,
      title: newQuizTitle.trim() || undefined,
      timestamp: newQuizTimestamp.trim() || undefined,
    });
    setQuizQuestion("");
    setQuizOptions(["", ""]);
    setQuizCorrectAnswer(null);
    setQuizCorrectAnswers([]);
    setQuizIsMultipleChoice(false);
    setQuizIsScored(true);
    setNewQuizTitle("");
    setNewQuizTimestamp("");
    toast.success("Quiz created!");
  };

  const vote = (quizId, optionIndex, optionIndices = null) => {
    if (!socket) return;
    // Check if quiz is published
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz || !quiz.published) {
      toast.error("This quiz is not published yet");
      return;
    }
    // Check if quiz is stopped
    if (quiz.stopped) {
      toast.error("Quiz is stopped. No more votes allowed.");
      return;
    }
    
    // Support both single and multiple choice
    if (optionIndices !== null && Array.isArray(optionIndices)) {
      socket.emit("quiz:vote", { sessionId, quizId, optionIndices });
    } else {
      socket.emit("quiz:vote", { sessionId, quizId, optionIndex });
    }
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
        {/* Quiz Launch Modal (Tutor) */}
        {isTutor && showQuizLaunchModal && quizToLaunch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold text-white mb-2">Do you wish to launch the Quiz?</div>
                <div className="text-sm text-white/70">{quizToLaunch.question}</div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowQuizLaunchModal(false);
                    setQuizToLaunch(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    if (socket && quizToLaunch) {
                      socket.emit("quiz:publish", { sessionId, quizId: quizToLaunch.id });
                      toast.success("Quiz launched!");
                      setShowQuizLaunchModal(false);
                      setQuizToLaunch(null);
                    }
                  }}
                >
                  Launch
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Creator Modal (Tutor) */}
        {isTutor && showQuizCreator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-white">Create New Quiz</div>
                <button
                  onClick={() => {
                    setShowQuizCreator(false);
                    setNewQuizTitle("");
                    setNewQuizTimestamp("");
                    setQuizQuestion("");
                    setQuizOptions(["", ""]);
                    setQuizCorrectAnswer(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1">Quiz Title (optional)</label>
                  <input
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    placeholder="e.g., Quiz 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1">Timestamp (optional)</label>
                  <input
                    value={newQuizTimestamp}
                    onChange={(e) => setNewQuizTimestamp(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    placeholder="e.g., 10:26"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1">Question</label>
                  <input
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    placeholder="Enter quiz question…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1">Options</label>
                  <div className="space-y-2">
                    {quizOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        value={opt}
                        onChange={(e) => {
                          const next = [...quizOptions];
                          next[idx] = e.target.value;
                          setQuizOptions(next);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                        placeholder={`Option ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setQuizOptions((q) => (q.length < 10 ? [...q, ""] : q))}
                    className="mt-2 text-xs text-white/60 hover:text-white/80"
                  >
                    + Add Option
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1">Correct Answer (optional)</label>
                  <select
                    value={quizCorrectAnswer !== null ? quizCorrectAnswer : ""}
                    onChange={(e) => setQuizCorrectAnswer(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="">None</option>
                    {quizOptions.map((opt, idx) => (
                      <option key={idx} value={idx}>
                        {opt || `Option ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowQuizCreator(false);
                      setNewQuizTitle("");
                      setNewQuizTimestamp("");
                      setQuizQuestion("");
                      setQuizOptions(["", ""]);
                      setQuizCorrectAnswer(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      createQuiz();
                      setShowQuizCreator(false);
                      setNewQuizTitle("");
                      setNewQuizTimestamp("");
                    }}
                  >
                    Create Quiz
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        {leftSidebarTab === "leaderboard" && (
          <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <div className="text-lg font-semibold text-white">Leaderboard</div>
                </div>
                <button
                  onClick={() => setLeftSidebarTab("students")}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scores yet. Quizzes will update the leaderboard.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard
                    .sort((a, b) => b.score - a.score)
                    .map((entry, idx) => (
                      <div
                        key={entry.userId}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                            idx === 1 ? "bg-gray-400/20 text-gray-300" :
                            idx === 2 ? "bg-orange-500/20 text-orange-400" :
                            "bg-white/10 text-white/60"
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white/90">{entry.name || "Unknown"}</div>
                            <div className="text-xs text-white/50">{entry.email || ""}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-400" />
                          <div className="text-sm font-bold text-white">{entry.score}</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learner Quiz Popup */}
        {!isTutor && quizPopupOpen && activeQuiz && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={quizDialogTitleId}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setQuizPopupOpen(false);
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white p-5 text-text shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-textMuted">Quiz</div>
                  <div id={quizDialogTitleId} className="mt-1 text-lg font-semibold text-text">
                    {activeQuiz.question}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setQuizPopupOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {activeQuiz.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    ref={idx === 0 ? firstQuizOptionRef : null}
                    className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                    onClick={() => {
                      vote(activeQuiz.id, idx);
                      toast.success("Answer submitted");
                      setQuizPopupOpen(false);
                    }}
                  >
                    <span className="font-semibold text-textSoft">{opt}</span>
                    <span className="text-xs font-semibold text-textMuted">{activeQuiz.counts?.[idx] ?? 0}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 text-xs text-textMuted">Answer now — your response is recorded instantly.</div>
            </div>
          </div>
        )}

        {/* Top Navigation Bar - Scaler Style */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 border-b border-white/10 bg-[#1a1f2e] px-4 py-2.5">
          {/* Left: Lecture title with back arrow */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-white/80" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                Lecture | {session?.name || "Live Session"}
              </div>
            </div>
          </div>

          {/* Center: Quiz tabs - List ALL quizzes */}
          <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide px-4">
            <button
              onClick={() => setSelectedQuizTab("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedQuizTab === "all"
                  ? "bg-blue-600 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              All Quizzes
            </button>
            {Array.isArray(quizzes) && quizzes.length > 0 ? (
              quizzes
                .filter(q => q && q.id) // Filter out any null/undefined quizzes
                .map((quiz, idx) => {
                  const timestamp = quiz.timestamp || (quiz.ts ? new Date(quiz.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "");
                  const quizLabel = quiz.title || `Quiz ${idx + 1}${timestamp ? ` (${timestamp})` : ""}`;
                  return (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        setSelectedQuizTab(quiz.id);
                        if (mode === "studio") {
                          setQuizToLaunch(quiz);
                          setShowQuizLaunchModal(true);
                        }
                      }}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        selectedQuizTab === quiz.id
                          ? "bg-blue-600 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {quizLabel}
                    </button>
                  );
                })
            ) : (
              <div className="text-xs text-white/50 px-3 py-1.5 whitespace-nowrap">No quizzes yet</div>
            )}
            {mode === "studio" && (
              <button
                onClick={() => setShowQuizCreator(true)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap"
                title="Create new quiz"
              >
                <Plus className="h-3.5 w-3.5" />
                New Quiz
              </button>
            )}
          </div>

          {/* Right: Trophy and Settings icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setLeftSidebarTab("leaderboard")}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Leaderboard"
            >
              <Trophy className="h-5 w-5 text-white/80" />
            </button>
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5 text-white/80" />
            </button>
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

        {/* Main layout: left sidebar (studio mode only) + stage + right panel */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar - Studio Mode Only (Tutors, LSM, PM, Admin) */}
          {mode === "studio" && (
            <div className={`${showLeftSidebar ? "w-[320px]" : "w-0"} flex-shrink-0 border-r border-white/10 bg-[#0d1326] flex flex-col transition-all duration-200 overflow-hidden`}>
              {showLeftSidebar && (
                <>
                  {/* Tabs: Students, Quiz, Leaderboard */}
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
                      onClick={() => setLeftSidebarTab("quizzes")}
                      className={`flex-1 px-3 py-2 text-xs font-semibold hover:bg-white/5 ${
                        leftSidebarTab === "quizzes"
                          ? "text-white/90 border-b-2 border-white/80"
                          : "text-white/60"
                      }`}
                    >
                      Quiz
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

                    {leftSidebarTab === "quizzes" && (
                      <div className="flex flex-col h-full">
                        {/* Quiz Creation Form - Always visible in studio mode */}
                        <div className="flex-shrink-0 p-2 border-b border-white/10">
                          <div className="rounded-lg border border-white/10 bg-black/20 p-2 space-y-2">
                            <div className="text-xs font-semibold text-white/70">Create Quiz</div>
                            <input
                              value={quizQuestion}
                              onChange={(e) => setQuizQuestion(e.target.value)}
                              className="w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white outline-none focus:border-white/30"
                              placeholder="Poll question…"
                            />
                            <div className="space-y-1">
                              {quizOptions.map((opt, idx) => (
                                <input
                                  key={idx}
                                  value={opt}
                                  onChange={(e) => {
                                    const next = [...quizOptions];
                                    next[idx] = e.target.value;
                                    setQuizOptions(next);
                                  }}
                                  className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
                                  placeholder={`Option${idx + 1}`}
                                />
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="secondary"
                                className="flex-1 text-xs py-1"
                                onClick={() => setQuizOptions((q) => (q.length < 10 ? [...q, ""] : q))}
                              >
                                Add Option
                              </Button>
                              <Button
                                variant="primary"
                                className="flex-1 text-xs py-1"
                                onClick={createQuiz}
                              >
                                Create
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-white/70">Correct Answer (optional):</label>
                              <select
                                value={quizCorrectAnswer !== null ? quizCorrectAnswer : ""}
                                onChange={(e) => setQuizCorrectAnswer(e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none focus:border-white/30"
                              >
                                <option value="">None</option>
                                {quizOptions.map((opt, idx) => (
                                  <option key={idx} value={idx}>
                                    {opt || `Option ${idx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        {/* Quizzes List */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          <style>{`.quizzes-scroll::-webkit-scrollbar { display: none; }`}</style>
                          <div className="quizzes-scroll">
                          {quizzes.length === 0 ? (
                            <div className="p-4 text-sm text-white/60 text-center">No polls yet.</div>
                          ) : (
                            quizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2"
                            >
                              <div className="text-sm font-semibold text-white/90">{quiz.question}</div>
                              <div className="text-xs text-white/60">
                                {quiz.published ? "Published" : "Draft"}
                                {quiz.correctAnswer !== null && " • Answer set"}
                              </div>
                              {!quiz.published && (
                                <Button
                                  variant="primary"
                                  className="w-full text-xs py-1"
                                  onClick={() => {
                                    if (socket) {
                                      socket.emit("quiz:publish", { sessionId, quizId: quiz.id });
                                    }
                                  }}
                                >
                                  Publish
                                </Button>
                              )}
                              {quiz.published && quiz.correctAnswer === null && (
                                <div className="space-y-1">
                                  <label className="text-xs text-white/70">Set correct answer:</label>
                                  <select
                                    className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
                                    onChange={(e) => {
                                      const idx = Number(e.target.value);
                                      if (!isNaN(idx) && socket) {
                                        socket.emit("quiz:correctAnswer", {
                                          sessionId,
                                          quizId: quiz.id,
                                          correctAnswer: idx,
                                        });
                                      }
                                    }}
                                  >
                                    <option value="">Select...</option>
                                    {quiz.options?.map((opt, idx) => (
                                      <option key={idx} value={idx}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {quiz.published && quiz.votes && (
                                <div className="text-xs text-white/60">
                                  Votes: {Object.keys(quiz.votes).length}
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
                                    <div className="text-sm font-semibold text-white/90">{entry.name || 'Unknown'}</div>
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
              {!showLeftSidebar && mode === "studio" && (
                <button
                  type="button"
                  onClick={() => setShowLeftSidebar(true)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#0d1326] border-r border-y border-white/10 px-2 py-4 rounded-r-lg hover:bg-[#0f1628] z-10"
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
                    {tutorUplinks.map((u) => {
                      const hasVideo = u.stream?.getVideoTracks()?.some(t => t.readyState === 'live');
                      const hasAudio = u.stream?.getAudioTracks()?.some(t => t.readyState === 'live');
                      return (
                        <div key={u.socketId} className="relative w-[160px] overflow-hidden rounded-lg border border-white/10 bg-black">
                          {hasVideo ? (
                            <video
                              autoPlay
                              playsInline
                              muted={false}
                              ref={(el) => {
                                if (!el || !u.stream) return;
                                if (el.srcObject !== u.stream) {
                                  el.srcObject = u.stream;
                                  el.play().catch(() => {});
                                }
                              }}
                              className="h-[96px] w-full object-cover bg-black"
                              onLoadedMetadata={(e) => {
                                e.target.play().catch(() => {});
                              }}
                            />
                          ) : (
                            <div className="h-[96px] w-full flex items-center justify-center bg-black/50">
                              <div className="text-white/40 text-xs">No video</div>
                            </div>
                          )}
                          {/* Audio element for audio-only or audio+video */}
                          {hasAudio && (
                            <audio
                              autoPlay
                              ref={(el) => {
                                if (!el || !u.stream) return;
                                if (el.srcObject !== u.stream) {
                                  el.srcObject = u.stream;
                                  el.play().catch(() => {});
                                }
                              }}
                            />
                          )}
                          <div className="absolute bottom-1 left-1 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white/90">
                            {u.user?.name || "Student"}
                          </div>
                          <div className="absolute top-1 right-1 flex gap-1">
                            {hasVideo && <div className="w-2 h-2 rounded-full bg-green-500" title="Video on" />}
                            {hasAudio && <div className="w-2 h-2 rounded-full bg-blue-500" title="Audio on" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          {/* Right panel - Scaler Style with Tabs */}
          <div className="hidden lg:flex flex-col border-l border-white/10 bg-[#0d1326] w-[380px] flex-shrink-0 h-full">
            {/* Tab Header */}
            <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {rightSidebarTab === "chat" && (
                  <>
                    <MessageSquare className="h-4 w-4 text-white/80" />
                    Chat
                    {mentionAlerts > 0 && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-200 ring-1 ring-rose-500/30">
                        {mentionAlerts}
                      </span>
                    )}
                  </>
                )}
                {rightSidebarTab === "bookmarks" && (
                  <>
                    <Bookmark className="h-4 w-4 text-white/80" />
                    Bookmarks & Notes
                    {bookmarks.length > 0 && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-200 ring-1 ring-blue-500/30">
                        {bookmarks.length}
                      </span>
                    )}
                  </>
                )}
                {rightSidebarTab === "notes" && (
                  <>
                    <FileText className="h-4 w-4 text-white/80" />
                    Lecture Notes
                    {lectureNotes.length > 0 && (
                      <span className="ml-1 inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-200 ring-1 ring-blue-500/30">
                        {lectureNotes.length}
                      </span>
                    )}
                  </>
                )}
                {rightSidebarTab === "notice" && (
                  <>
                    <Bell className="h-4 w-4 text-white/80" />
                    Notice Board
                  </>
                )}
              </div>
              <button
                onClick={() => setRightSidebarTab("chat")}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            {/* Tab Navigation - Bottom */}
            <div className="flex-shrink-0 flex items-center border-t border-white/10 bg-[#0d1326]">
              <button
                onClick={() => setRightSidebarTab("chat")}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  rightSidebarTab === "chat"
                    ? "text-orange-400 border-b-2 border-orange-400 bg-white/5"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                Chat
                {mentionAlerts > 0 && rightSidebarTab !== "chat" && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-200">
                    {mentionAlerts}
                  </span>
                )}
              </button>
              <button
                onClick={() => setRightSidebarTab("bookmarks")}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  rightSidebarTab === "bookmarks"
                    ? "text-orange-400 border-b-2 border-orange-400 bg-white/5"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                Bookmarks & Notes
                {bookmarks.length > 0 && rightSidebarTab !== "bookmarks" && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-200">
                    {bookmarks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setRightSidebarTab("notes")}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  rightSidebarTab === "notes"
                    ? "text-orange-400 border-b-2 border-orange-400 bg-white/5"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                Lecture Notes
                {lectureNotes.length > 0 && rightSidebarTab !== "notes" && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-200">
                    {lectureNotes.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setRightSidebarTab("notice")}
                className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  rightSidebarTab === "notice"
                    ? "text-orange-400 border-b-2 border-orange-400 bg-white/5"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                Notice Board
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Chat Tab Content */}
              {rightSidebarTab === "chat" && (
                <>

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

              {/* Chat messages - Scrollable (only comments, no quizzes/resources) */}
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
                </>
              )}

              {/* Bookmarks Tab Content */}
              {rightSidebarTab === "bookmarks" && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 scrollbar-hide">
                  <div className="space-y-3">
                    {/* Allow all users to create bookmarks */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Bookmark title..."
                        value={bookmarkTitle}
                        onChange={(e) => setBookmarkTitle(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
                      />
                      <textarea
                        placeholder="Notes (optional)..."
                        value={bookmarkNotes}
                        onChange={(e) => setBookmarkNotes(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30 resize-none"
                      />
                      <button
                        onClick={async () => {
                          if (!bookmarkTitle.trim()) {
                            toast.error("Please enter a bookmark title");
                            return;
                          }
                          try {
                            const timestamp = 0; // TODO: Get actual video timestamp
                            const res = await sessionAPI.createBookmark(sessionId, {
                              timestamp,
                              title: bookmarkTitle.trim(),
                              notes: bookmarkNotes.trim(),
                            });
                            if (res.success) {
                              setBookmarks((prev) => [...prev, res.data.bookmark]);
                              setBookmarkTitle("");
                              setBookmarkNotes("");
                              toast.success("Bookmark created");
                            }
                          } catch (error) {
                            toast.error("Failed to create bookmark");
                          }
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2 justify-center"
                      >
                        <Plus className="h-4 w-4" />
                        Add Bookmark
                      </button>
                    </div>
                    {bookmarks.length === 0 ? (
                      <div className="text-center py-8 text-white/60 text-sm">
                        No bookmarks yet.
                      </div>
                    ) : (
                      bookmarks.map((bookmark) => {
                        const isOwner = String(bookmark.createdBy?.id || bookmark.userId) === String(user?.id || user?._id);
                        return (
                          <div
                            key={bookmark.id || bookmark._id}
                            className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white/90">{bookmark.title || "Untitled Bookmark"}</div>
                                {bookmark.notes && (
                                  <div className="text-xs text-white/60 mt-1">{bookmark.notes}</div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="text-xs text-white/50">
                                    {bookmark.timestamp ? `${bookmark.timestamp}s` : "No timestamp"}
                                  </div>
                                  {bookmark.createdBy?.name && (
                                    <>
                                      <span className="text-xs text-white/30">•</span>
                                      <div className="text-xs text-white/50">
                                        by {bookmark.createdBy.name}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {(isOwner || isTutor) && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await sessionAPI.deleteBookmark(bookmark.id || bookmark._id);
                                      if (res.success) {
                                        setBookmarks((prev) => prev.filter((b) => (b.id || b._id) !== (bookmark.id || bookmark._id)));
                                        toast.success("Bookmark deleted");
                                      }
                                    } catch (error) {
                                      toast.error("Failed to delete bookmark");
                                    }
                                  }}
                                  className="p-1 hover:bg-white/10 rounded"
                                >
                                  <X className="h-3.5 w-3.5 text-white/60" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Lecture Notes Tab Content */}
              {rightSidebarTab === "notes" && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 scrollbar-hide">
                  <div className="space-y-3">
                    {canCreateContent && (
                      <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3">
                        <input
                          type="text"
                          placeholder="Note title..."
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
                        />
                        <textarea
                          placeholder="Description (optional)..."
                          value={noteDescription}
                          onChange={(e) => setNoteDescription(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30 resize-none"
                        />
                        <input
                          type="url"
                          placeholder="Or paste a link (optional)..."
                          value={noteUrl}
                          onChange={(e) => setNoteUrl(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,application/pdf,.doc,.docx"
                              onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors">
                              <Upload className="h-4 w-4" />
                              {noteFile ? noteFile.name : "Upload file (image/PDF)"}
                            </div>
                          </label>
                          {noteFile && (
                            <button
                              onClick={() => setNoteFile(null)}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <X className="h-3.5 w-3.5 text-white/60" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (!noteTitle.trim() && !noteFile && !noteUrl.trim()) {
                              toast.error("Please provide a title, file, or link");
                              return;
                            }
                            try {
                              setNoteUploading(true);
                              let fileUrl = null;
                              let fileKey = null;
                              let fileName = null;
                              let fileSize = 0;
                              let mimeType = null;

                              if (noteFile) {
                                const uploadRes = await uploadAPI.uploadFile(noteFile, 'session-notes');
                                if (uploadRes.success) {
                                  fileUrl = uploadRes.data.url;
                                  fileKey = uploadRes.data.key;
                                  fileName = noteFile.name;
                                  fileSize = noteFile.size;
                                  mimeType = noteFile.type;
                                } else {
                                  throw new Error("File upload failed");
                                }
                              }

                              const res = await sessionAPI.createResource(sessionId, {
                                title: noteTitle.trim() || (noteFile ? noteFile.name : "Untitled Note"),
                                description: noteDescription.trim(),
                                url: noteUrl.trim() || fileUrl || "",
                                fileKey,
                                fileName,
                                fileSize,
                                mimeType,
                                fileUrl,
                              });
                              if (res.success) {
                                setLectureNotes((prev) => [...prev, res.data.resource]);
                                setNoteTitle("");
                                setNoteDescription("");
                                setNoteUrl("");
                                setNoteFile(null);
                                toast.success("Note created");
                              }
                            } catch (error) {
                              toast.error(error.message || "Failed to create note");
                            } finally {
                              setNoteUploading(false);
                            }
                          }}
                          disabled={noteUploading}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          {noteUploading ? "Uploading..." : "Add Note"}
                        </button>
                      </div>
                    )}
                    {lectureNotes.length === 0 ? (
                      <div className="text-center py-8 text-white/60 text-sm">
                        No lecture notes yet.
                      </div>
                    ) : (
                      lectureNotes.map((note) => {
                        const isImage = note.mimeType?.startsWith('image/') || note.type === 'IMAGE';
                        const isPDF = note.mimeType === 'application/pdf' || note.type === 'PDF';
                        const fileUrl = note.fileUrl || note.url;
                        return (
                          <div
                            key={note.id || note._id}
                            className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white/90">{note.title}</div>
                                {(note.description || note.content) && (
                                  <div className="text-xs text-white/60 mt-1">{note.description || note.content}</div>
                                )}
                                {isImage && fileUrl && (
                                  <img
                                    src={fileUrl}
                                    alt={note.title}
                                    className="mt-2 rounded-lg max-w-full h-auto max-h-64 object-contain"
                                  />
                                )}
                                {isPDF && fileUrl && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-2 text-xs text-blue-400 hover:underline"
                                  >
                                    <File className="h-4 w-4" />
                                    {note.fileName || "View PDF"}
                                  </a>
                                )}
                                {note.type === 'LINK' && note.url && !fileUrl && (
                                  <a
                                    href={note.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-2 text-xs text-blue-400 hover:underline"
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                    {note.url}
                                  </a>
                                )}
                                {fileUrl && !isImage && !isPDF && note.type !== 'LINK' && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-2 text-xs text-blue-400 hover:underline"
                                  >
                                    <File className="h-4 w-4" />
                                    {note.fileName || "Download file"}
                                  </a>
                                )}
                                <div className="text-xs text-white/50 mt-1">
                                  {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                                </div>
                              </div>
                              {canCreateContent && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await sessionAPI.deleteResource(note.id || note._id);
                                      if (res.success) {
                                        setLectureNotes((prev) => prev.filter((n) => (n.id || n._id) !== (note.id || note._id)));
                                        toast.success("Note deleted");
                                      }
                                    } catch (error) {
                                      toast.error("Failed to delete note");
                                    }
                                  }}
                                  className="p-1 hover:bg-white/10 rounded"
                                >
                                  <X className="h-3.5 w-3.5 text-white/60" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Notice Board Tab Content */}
              {rightSidebarTab === "notice" && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 scrollbar-hide">
                  <div className="space-y-3">
                    {isTutor && (
                      <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3">
                        <input
                          type="text"
                          placeholder="Notice title..."
                          value={noticeTitle}
                          onChange={(e) => setNoticeTitle(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
                        />
                        <textarea
                          placeholder="Description (optional)..."
                          value={noticeDescription}
                          onChange={(e) => setNoticeDescription(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30 resize-none"
                        />
                        <input
                          type="url"
                          placeholder="Or paste a link (optional)..."
                          value={noticeUrl}
                          onChange={(e) => setNoticeUrl(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,application/pdf,.doc,.docx"
                              onChange={(e) => setNoticeFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors">
                              <Upload className="h-4 w-4" />
                              {noticeFile ? noticeFile.name : "Upload file (image/PDF)"}
                            </div>
                          </label>
                          {noticeFile && (
                            <button
                              onClick={() => setNoticeFile(null)}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <X className="h-3.5 w-3.5 text-white/60" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (!noticeTitle.trim() && !noticeFile && !noticeUrl.trim()) {
                              toast.error("Please provide a title, file, or link");
                              return;
                            }
                            try {
                              setNoticeUploading(true);
                              let fileUrl = null;
                              let fileKey = null;
                              let fileName = null;
                              let fileSize = 0;
                              let mimeType = null;

                              if (noticeFile) {
                                const uploadRes = await uploadAPI.uploadFile(noticeFile, 'session-notices');
                                if (uploadRes.success) {
                                  fileUrl = uploadRes.data.url;
                                  fileKey = uploadRes.data.key;
                                  fileName = noticeFile.name;
                                  fileSize = noticeFile.size;
                                  mimeType = noticeFile.type;
                                } else {
                                  throw new Error("File upload failed");
                                }
                              }

                              const res = await sessionAPI.createNotice(sessionId, {
                                title: noticeTitle.trim() || (noticeFile ? noticeFile.name : "Untitled Notice"),
                                description: noticeDescription.trim(),
                                url: noticeUrl.trim() || fileUrl || undefined,
                                fileKey,
                                fileName,
                                fileSize,
                                mimeType,
                                fileUrl,
                              });
                              if (res.success) {
                                setNotices((prev) => [...prev, res.data.notice]);
                                setNoticeTitle("");
                                setNoticeDescription("");
                                setNoticeUrl("");
                                setNoticeFile(null);
                                toast.success("Notice created");
                              }
                            } catch (error) {
                              toast.error(error.message || "Failed to create notice");
                            } finally {
                              setNoticeUploading(false);
                            }
                          }}
                          disabled={noticeUploading}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          {noticeUploading ? "Uploading..." : "Add Notice"}
                        </button>
                      </div>
                    )}
                    {notices.length === 0 ? (
                      <div className="text-center py-8 text-white/60 text-sm">
                        No notices yet.
                      </div>
                    ) : (
                      notices.map((notice) => {
                        const isImage = notice.mimeType?.startsWith('image/') || notice.type === 'IMAGE';
                        const isPDF = notice.mimeType === 'application/pdf' || notice.type === 'PDF';
                        const fileUrl = notice.fileUrl || notice.url;
                        return (
                          <div
                            key={notice.id || notice._id}
                            className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white/90">{notice.title}</div>
                                {(notice.description || notice.content) && (
                                  <div className="text-xs text-white/60 mt-1">{notice.description || notice.content}</div>
                                )}
                                {isImage && fileUrl && (
                                  <img
                                    src={fileUrl}
                                    alt={notice.title}
                                    className="mt-2 rounded-lg max-w-full h-auto max-h-64 object-contain"
                                  />
                                )}
                                {isPDF && fileUrl && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-2 text-xs text-blue-400 hover:underline"
                                  >
                                    <File className="h-4 w-4" />
                                    {notice.fileName || "View PDF"}
                                  </a>
                                )}
                                {notice.type === 'LINK' && notice.url && !fileUrl && (
                                  <a
                                    href={notice.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-2 text-xs text-blue-400 hover:underline"
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                    {notice.url}
                                  </a>
                                )}
                                {fileUrl && !isImage && !isPDF && notice.type !== 'LINK' && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-2 text-xs text-blue-400 hover:underline"
                                  >
                                    <File className="h-4 w-4" />
                                    {notice.fileName || "Download file"}
                                  </a>
                                )}
                                <div className="text-xs text-white/50 mt-1">
                                  {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : ""}
                                </div>
                              </div>
                              {canCreateContent && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await sessionAPI.deleteNotice(notice.id || notice._id);
                                      if (res.success) {
                                        setNotices((prev) => prev.filter((n) => (n.id || n._id) !== (notice.id || notice._id)));
                                        toast.success("Notice deleted");
                                      }
                                    } catch (error) {
                                      toast.error("Failed to delete notice");
                                    }
                                  }}
                                  className="p-1 hover:bg-white/10 rounded"
                                >
                                  <X className="h-3.5 w-3.5 text-white/60" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

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
      {/* Learner Quiz Popup */}
      {!isTutor && quizPopupOpen && activeQuiz && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-brintelli-border bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-textMuted">Quiz</div>
                <div className="mt-1 text-lg font-semibold text-text">{activeQuiz.question}</div>
              </div>
              <Button variant="secondary" onClick={() => setQuizPopupOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {activeQuiz.options?.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                  onClick={() => {
                    vote(activeQuiz.id, idx);
                    toast.success("Answer submitted");
                    setQuizPopupOpen(false);
                  }}
                >
                  <span className="font-semibold text-textSoft">{opt}</span>
                  <span className="text-xs font-semibold text-textMuted">{activeQuiz.counts?.[idx] ?? 0}</span>
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
        description="Chat, resources, quizzes, and screen sharing — all in one room."
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
        {/* Learner Quiz Popup - inside main layout */}
        {!isTutor && quizPopupOpen && activeQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-brintelli-border bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-textMuted">Quiz</div>
                  <div className="mt-1 text-lg font-semibold text-text">{activeQuiz.question}</div>
                </div>
                <Button variant="secondary" onClick={() => setQuizPopupOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {activeQuiz.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-3 py-2 text-left text-sm hover:bg-brintelli-baseAlt"
                    onClick={() => {
                      vote(activeQuiz.id, idx);
                      toast.success("Answer submitted");
                      setQuizPopupOpen(false);
                    }}
                  >
                    <span className="font-semibold text-textSoft">{opt}</span>
                    <span className="text-xs font-semibold text-textMuted">{activeQuiz.counts?.[idx] ?? 0}</span>
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

          {/* Bottom utility area: Recording fallback + Resources + Quizzes (kept for now, will be tightened next) */}
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

            {/* Quizzes (tutor/admin only) */}
            {canModerate && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-text">
                  <BarChart3 className="h-4 w-4 text-brand-600" />
                  Quizzes
                </div>
                  <Button variant="secondary" onClick={() => setShowQuizComposer((v) => !v)}>
                    {showQuizComposer ? "Close" : "Create"}
                  </Button>
              </div>

              {showQuizComposer && (
                <div className="mt-3 space-y-2">
                  <input
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                    placeholder="Quiz question…"
                  />
                  {quizOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      value={opt}
                      onChange={(e) => {
                        const next = [...quizOptions];
                        next[idx] = e.target.value;
                        setQuizOptions(next);
                      }}
                      className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setQuizOptions((q) => (q.length < 10 ? [...q, ""] : q))}
                    >
                      Add option
                    </Button>
                    <Button onClick={createQuiz}>Create quiz</Button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {quizzes.length === 0 ? (
                  <div className="text-sm text-textMuted">No quizzes yet.</div>
                ) : (
                  quizzes.map((q) => (
                    <div key={q.id} className="rounded-xl border border-brintelli-border bg-white p-3">
                      <div className="font-semibold text-text">{q.question}</div>
                      <div className="mt-2 space-y-2">
                        {q.options?.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => vote(q.id, idx)}
                            className="flex w-full items-center justify-between rounded-lg border border-brintelli-border px-3 py-2 text-left text-sm text-textSoft hover:bg-brintelli-baseAlt"
                          >
                            <span>{opt}</span>
                            <span className="text-xs font-semibold text-textMuted">
                              {q.counts?.[idx] ?? 0}
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


