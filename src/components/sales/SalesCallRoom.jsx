import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  MessageSquare,
  Users,
  Link as LinkIcon,
  Monitor,
  Video,
  Camera,
  Mic,
  MicOff,
  X,
  FileText,
  DollarSign,
  Play,
  ExternalLink,
  Settings,
  ArrowLeft,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import PageHeader from "../PageHeader";
import Button from "../Button";
import Modal from "../Modal";
import { getSocket } from "../../utils/socketClient";
import { selectCurrentUser, selectToken } from "../../store/slices/authSlice";
import salesCallApi from "../../api/salesCall";
import { fetchSalesTeam, selectSalesTeam } from "../../store/slices/salesTeamSlice";

// WebRTC configuration
const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function SalesCallRoom({ callId, call }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const salesTeam = useSelector(selectSalesTeam);

  const role = user?.role;
  const isHost = role === "sales_executive" || role === "sales_lead" || role === "sales_admin" || role === "sales_agent";

  const socket = useMemo(() => (token ? getSocket(token) : null), [token]);

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sharedResources, setSharedResources] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("tools"); // "tools" | "chat" | "notes"
  const [chatInput, setChatInput] = useState("");
  const [privateNotes, setPrivateNotes] = useState(call?.privateNotes || "");
  const [leadStatusUpdate, setLeadStatusUpdate] = useState(call?.leadStatusUpdate || null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);

  // WebRTC
  const cameraPreviewRef = useRef(null);
  const remoteCameraRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const pcsRef = useRef(new Map());
  const [micMuted, setMicMuted] = useState(false);
  const [camOn, setCamOn] = useState(isHost); // Host camera ON by default
  const [hasRemoteCamera, setHasRemoteCamera] = useState(false);
  const [callStatus, setCallStatus] = useState(call?.status || "SCHEDULED");
  const [hasJoined, setHasJoined] = useState(false);

  // Sales tools
  const [courseLink, setCourseLink] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [demoVideoLink, setDemoVideoLink] = useState("");

  // Invite members
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // Fetch sales team for invite modal
  useEffect(() => {
    if (showInviteModal && salesTeam.length === 0) {
      dispatch(fetchSalesTeam());
    }
  }, [showInviteModal, salesTeam.length, dispatch]);

  // Initialize camera/mic
  useEffect(() => {
    if (camOn && isHost && cameraPreviewRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: !micMuted })
        .then((stream) => {
          cameraStreamRef.current = stream;
          if (cameraPreviewRef.current) {
            cameraPreviewRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error accessing camera/mic:", error);
          toast.error("Failed to access camera/microphone");
        });
    }

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camOn, micMuted, isHost]);

  // Join session
  useEffect(() => {
    if (!socket || !callId || hasJoined) return;

    const handleJoin = () => {
      socket.emit("session:join", { sessionId: callId });
      setHasJoined(true);
    };

    socket.on("connect", handleJoin);
    if (socket.connected) handleJoin();

    return () => {
      socket.off("connect", handleJoin);
    };
  }, [socket, callId, hasJoined]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleParticipants = ({ participants: p }) => {
      setParticipants(p || []);
    };

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleResourceShared = ({ resource }) => {
      setSharedResources((prev) => [...prev, resource]);
      toast.success("Resource shared");
    };

    const handleLeadStatusUpdated = ({ leadStatusUpdate: status }) => {
      setLeadStatusUpdate(status);
      toast.success("Lead status updated");
    };

    const handleCallEnded = () => {
      setCallStatus("COMPLETED");
      toast.success("Call ended");
    };

    const handleError = ({ error }) => {
      toast.error(error || "An error occurred");
    };

    socket.on("session:participants", handleParticipants);
    socket.on("chat:message", handleChatMessage);
    socket.on("sales:call:resource-shared", handleResourceShared);
    socket.on("sales:call:lead-status-updated", handleLeadStatusUpdated);
    socket.on("sales:call:ended", handleCallEnded);
    socket.on("session:error", handleError);

    return () => {
      socket.off("session:participants", handleParticipants);
      socket.off("chat:message", handleChatMessage);
      socket.off("sales:call:resource-shared", handleResourceShared);
      socket.off("sales:call:lead-status-updated", handleLeadStatusUpdated);
      socket.off("sales:call:ended", handleCallEnded);
      socket.off("session:error", handleError);
    };
  }, [socket]);

  // Start call
  const handleStartCall = async () => {
    try {
      await salesCallApi.startCall(callId);
      setCallStatus("ONGOING");
      setCallStarted(true);
      toast.success("Call started");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start call");
    }
  };

  // End call
  const handleEndCall = async () => {
    try {
      const insights = {
        engagementLevel: "MEDIUM", // TODO: Calculate based on interaction
        chatTranscript: messages,
        sharedResources: sharedResources,
      };
      await salesCallApi.endCall(callId, insights, leadStatusUpdate);
      setCallStatus("COMPLETED");
      toast.success("Call ended and saved to CRM");
      navigate("/sales/calls");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to end call");
    }
  };

  // Share resource
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

  // Update lead status
  const handleUpdateLeadStatus = async (status) => {
    try {
      await salesCallApi.updateLeadStatus(callId, status);
      setLeadStatusUpdate(status);
      socket.emit("sales:call:update-lead-status", {
        sessionId: callId,
        leadStatusUpdate: status,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update lead status");
    }
  };

  // Save private notes
  const handleSaveNotes = async () => {
    try {
      await salesCallApi.updateCall(callId, { privateNotes });
      socket.emit("sales:call:save-notes", {
        sessionId: callId,
        notes: privateNotes,
      });
      toast.success("Notes saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save notes");
    }
  };

  // Send chat message
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit("chat:send", {
      sessionId: callId,
      message: chatInput,
      to: "everyone",
    });
    setChatInput("");
  };

  // Toggle camera
  const handleToggleCamera = () => {
    if (!isHost) {
      toast.error("Only host can control camera");
      return;
    }
    setCamOn((prev) => !prev);
  };

  // Toggle mic
  const handleToggleMic = () => {
    const newMuted = !micMuted;
    setMicMuted(newMuted);
    
    // Update audio track
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
  };

  // Invite members
  const handleInviteMembers = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one member to invite");
      return;
    }

    try {
      setInviteLoading(true);
      await salesCallApi.inviteMembers(callId, selectedUserIds);
      toast.success("Members invited successfully");
      setShowInviteModal(false);
      setSelectedUserIds([]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to invite members");
    } finally {
      setInviteLoading(false);
    }
  };

  // Copy invite link
  const handleCopyInviteLink = () => {
    const baseUrl = window.location.origin;
    const inviteLink = call?.meetingLink || `${baseUrl}/sales/calls/join/${call?.secureAccessToken}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
      setInviteLinkCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setInviteLinkCopied(false), 2000);
    });
  };

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gray-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/sales/calls")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Sales Call</h1>
            <p className="text-sm text-white/60">
              {call?.leadId ? `Lead: ${call.leadId}` : "Sales Video Call"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isHost && (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          )}
          {callStatus === "SCHEDULED" && isHost && (
            <Button onClick={handleStartCall} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start Call
            </Button>
          )}
          {callStatus === "ONGOING" && isHost && (
            <Button onClick={handleEndCall} className="bg-red-600 hover:bg-red-700">
              End Call
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main video area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-4">
          {/* Remote video */}
          {hasRemoteCamera && (
            <video
              ref={remoteCameraRef}
              autoPlay
              playsInline
              className="w-full h-full max-w-4xl rounded-lg bg-gray-800"
            />
          )}

          {/* Local video preview */}
          {camOn && (
            <div className="absolute bottom-4 right-4 w-64 h-48 rounded-lg overflow-hidden bg-gray-800 border-2 border-white/20">
              <video
                ref={cameraPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-gray-800/90 rounded-full px-4 py-2">
            <Button
              variant="ghost"
              onClick={handleToggleMic}
              className={`rounded-full ${micMuted ? "bg-red-600" : "bg-gray-700"}`}
            >
              {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            {isHost && (
              <Button
                variant="ghost"
                onClick={handleToggleCamera}
                className={`rounded-full ${camOn ? "bg-green-600" : "bg-gray-700"}`}
              >
                <Camera className="h-5 w-5" />
              </Button>
            )}
            {isHost && (
              <Button
                variant="ghost"
                onClick={() => {
                  // TODO: Implement screen sharing
                  toast.info("Screen sharing coming soon");
                }}
                className="rounded-full bg-gray-700"
              >
                <Monitor className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 border-l border-white/10 bg-gray-800 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setSidebarTab("tools")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  sidebarTab === "tools"
                    ? "bg-gray-700 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sales Tools
              </button>
              <button
                onClick={() => setSidebarTab("chat")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  sidebarTab === "chat"
                    ? "bg-gray-700 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setSidebarTab("notes")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  sidebarTab === "notes"
                    ? "bg-gray-700 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Notes
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {sidebarTab === "tools" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lead Status</label>
                    <select
                      value={leadStatusUpdate || ""}
                      onChange={(e) => handleUpdateLeadStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                    >
                      <option value="">Select status</option>
                      <option value="INTERESTED">Interested</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="CONVERTED">Converted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Share Course Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={courseLink}
                        onChange={(e) => setCourseLink(e.target.value)}
                        placeholder="Course URL"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                      />
                      <Button
                        onClick={() => handleShareResource("course", courseLink, "Course Link")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Share
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Share Payment Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paymentLink}
                        onChange={(e) => setPaymentLink(e.target.value)}
                        placeholder="Payment URL"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                      />
                      <Button
                        onClick={() => handleShareResource("payment", paymentLink, "Payment Link")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Share
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Share Demo Video</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={demoVideoLink}
                        onChange={(e) => setDemoVideoLink(e.target.value)}
                        placeholder="Video URL"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                      />
                      <Button
                        onClick={() => handleShareResource("video", demoVideoLink, "Demo Video")}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Share
                      </Button>
                    </div>
                  </div>

                  {sharedResources.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Shared Resources</label>
                      <div className="space-y-2">
                        {sharedResources.map((resource, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-gray-700 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium">{resource.title || resource.type}</p>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:underline"
                              >
                                {resource.url}
                              </a>
                            </div>
                            <ExternalLink className="h-4 w-4 text-white/60" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === "chat" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="p-2 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{msg.user?.name || "User"}</span>
                          <span className="text-xs text-white/60">
                            {new Date(msg.ts).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-white/90">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white"
                    />
                    <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                      Send
                    </Button>
                  </div>
                </div>
              )}

              {sidebarTab === "notes" && isHost && (
                <div className="flex flex-col h-full">
                  <textarea
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    placeholder="Private notes (only visible to you)..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white resize-none"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Save Notes
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invite Members Modal */}
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
          {/* Invite Link Section */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <label className="block text-sm font-medium mb-2">Invite Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={call?.meetingLink || `${window.location.origin}/sales/calls/join/${call?.secureAccessToken}`}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <Button
                onClick={handleCopyInviteLink}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                {inviteLinkCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with team members to invite them to the call
            </p>
          </div>

          {/* Team Members Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Team Members</label>
            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
              {salesTeam.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Loading team members...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {salesTeam
                    .filter((member) => member.id !== user?.userId && member.id !== user?.id)
                    .map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds([...selectedUserIds, member.id]);
                            } else {
                              setSelectedUserIds(selectedUserIds.filter((id) => id !== member.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.name || member.fullName}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                          <p className="text-xs text-gray-400 capitalize">{member.role?.replace('_', ' ')}</p>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                setShowInviteModal(false);
                setSelectedUserIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteMembers}
              disabled={selectedUserIds.length === 0 || inviteLoading}
            >
              {inviteLoading ? "Inviting..." : `Invite ${selectedUserIds.length} Member${selectedUserIds.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

