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
} from "lucide-react";
import PageHeader from "../PageHeader";
import Button from "../Button";
import { getSocket } from "../../utils/socketClient";
import { selectCurrentUser, selectToken } from "../../store/slices/authSlice";
import tutorAPI from "../../api/tutor";

const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function SessionRoom({ sessionId, session }) {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);

  const role = user?.role;
  const isTutor = role === "tutor";
  const canModerate = ["tutor", "admin", "programManager", "program-manager"].includes(role);

  const socket = useMemo(() => (token ? getSocket(token) : null), [token]);

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [polls, setPolls] = useState([]);

  const [chatInput, setChatInput] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceTitle, setResourceTitle] = useState("");

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

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
  const [sessionStatus, setSessionStatus] = useState(session?.status || "SCHEDULED");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingAnimRef = useRef(null);
  const [showPollComposer, setShowPollComposer] = useState(false);
  const [showResourceComposer, setShowResourceComposer] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrolledBatch, setEnrolledBatch] = useState(null);

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
  useEffect(() => {
    if (isTutor) {
      if (!screenStreamRef.current && cameraStreamRef.current && screenPreviewRef.current) {
        screenPreviewRef.current.srcObject = cameraStreamRef.current;
      }
    }
  }, [isTutor, broadcastMode]);

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
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // mic audio comes from camera stream to avoid echo
      });
      screenStreamRef.current = stream;

      // If camera isn't started, capture mic audio and attach to the screen stream so students can hear.
      if (!cameraStreamRef.current) {
        try {
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
    const onResource = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.resource) setResources((prev) => [payload.resource, ...prev].slice(0, 100));
    };
    const onPollSnapshot = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      setPolls(payload.polls || []);
    };
    const onPollNew = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (payload?.poll) setPolls((prev) => [payload.poll, ...prev]);
    };
    const onPollUpdate = (payload) => {
      if (payload?.sessionId !== sessionId) return;
      if (!payload?.poll) return;
      setPolls((prev) => prev.map((p) => (p.id === payload.poll.id ? payload.poll : p)));
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
              return;
            }
            if (meta.cameraStreamId && stream.id === meta.cameraStreamId) {
              if (remoteCameraRef.current) remoteCameraRef.current.srcObject = stream;
              return;
            }

            // Fallback
            if (remoteScreenRef.current && !remoteScreenRef.current.srcObject) {
              remoteScreenRef.current.srcObject = stream;
            } else if (remoteCameraRef.current && !remoteCameraRef.current.srcObject) {
              remoteCameraRef.current.srcObject = stream;
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
    socket.on("poll:update", onPollUpdate);
    socket.on("stream:meta", onStreamMeta);
    socket.on("webrtc:signal", onWebrtcSignal);
    socket.on("session:status", onSessionStatus);

    return () => {
      socket.emit("session:leave", { sessionId });
      socket.off("session:participants", onParticipants);
      socket.off("chat:message", onChat);
      socket.off("resource:new", onResource);
      socket.off("poll:snapshot", onPollSnapshot);
      socket.off("poll:new", onPollNew);
      socket.off("poll:update", onPollUpdate);
      socket.off("stream:meta", onStreamMeta);
      socket.off("webrtc:signal", onWebrtcSignal);
      socket.off("session:status", onSessionStatus);
      stopAllBroadcast();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, sessionId, isTutor]);

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

  const sendChat = () => {
    if (!socket) return;
    const msg = chatInput.trim();
    if (!msg) return;
    socket.emit("chat:send", { sessionId, message: msg });
    setChatInput("");
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
    socket.emit("poll:create", { sessionId, question: q, options: opts });
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowPollComposer(false);
  };

  const vote = (pollId, optionIndex) => {
    if (!socket) return;
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
      toast("No meeting link configured for this session", { icon: "ℹ️" });
    }
  };

  const startSession = () => {
    if (!socket) return;
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

  return (
    <>
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
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={toggleSpeaker}
                    title={speakerMuted ? "Unmute speaker" : "Mute speaker"}
                  >
                    {speakerMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {speakerMuted ? "Unmute" : "Mute"}
                  </Button>
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
                  {recordingUrlLocal && (
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={() => window.open(recordingUrlLocal, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open saved recording
                    </Button>
                  )}
                </div>
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

            {/* Resources */}
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-text">
                  <LinkIcon className="h-4 w-4 text-brand-600" />
                  Resources
                </div>
                {canModerate && (
                  <Button variant="secondary" onClick={() => setShowResourceComposer((v) => !v)}>
                    {showResourceComposer ? "Close" : "Add"}
                  </Button>
                )}
              </div>
              {canModerate && showResourceComposer && (
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
                    <Button variant="secondary" onClick={() => { shareResource(); setShowResourceComposer(false); }}>
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

            {/* Polls */}
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-text">
                  <BarChart3 className="h-4 w-4 text-brand-600" />
                  Polls
                </div>
                {canModerate && (
                  <Button variant="secondary" onClick={() => setShowPollComposer((v) => !v)}>
                    {showPollComposer ? "Close" : "Create"}
                  </Button>
                )}
              </div>

              {canModerate && showPollComposer && (
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

            {/* Students */}
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Full-height Comments */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-text">
              <MessageSquare className="h-4 w-4 text-brand-600" />
              Comments
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-textMuted">
              <Users className="h-4 w-4" />
              {participants.length} online
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-auto rounded-xl border border-brintelli-border bg-white p-3">
            {messages.length === 0 ? (
              <div className="text-sm text-textMuted">No messages yet.</div>
            ) : (
              <div className="space-y-2">
                {messages.map((m, idx) => (
                  <div key={`${m.ts}_${idx}`} className="text-sm">
                    <span className="font-semibold text-text">
                      {m.user?.name || "User"}{" "}
                      <span className="text-xs font-normal text-textMuted">({m.user?.role})</span>
                    </span>
                    <span className="text-textMuted">: </span>
                    <span className="text-textSoft">{m.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? sendChat() : null)}
              className="w-full rounded-xl border border-brintelli-border bg-white px-3 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
              placeholder="Ask doubts / leave comments…"
            />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </div>
    </>
  );
}


