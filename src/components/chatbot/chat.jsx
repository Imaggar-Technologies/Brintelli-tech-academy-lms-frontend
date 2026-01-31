import { useEffect, useState, useRef } from "react";
import { connectSocket, getSocket } from "../../utils/socket";
import { FiMessageSquare } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function Chat() {
  const token = useSelector((state) => state.auth.token);

  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lastMessageId, setLastMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const joinedRef = useRef(false); // ✅ prevent duplicate join

  /* ✅ CONNECT SOCKET WHEN TOKEN IS READY */
  useEffect(() => {
    if (!token) return;

    console.log("🟢 TOKEN READY → CONNECT SOCKET");
    connectSocket(token);
  }, [token]);

  /* ✅ SOCKET EVENTS — REGISTER ONCE */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => {
      if (!joinedRef.current) {
        socket.emit("conversation:join", { lastMessageId });
        joinedRef.current = true;
      }
    };

    const onSystem = (data) => {
      if (data.type === "conversation_joined") {
        setConversationId(data.conversationId);

        if (data.messages?.length) {
          setMessages(data.messages);
          setLastMessageId(
            data.messages[data.messages.length - 1]?._id
          );
        }
      }
    };

    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg._id) setLastMessageId(msg._id);
    };

    socket.on("connect", onConnect);
    socket.on("system", onSystem);
    socket.on("message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("system", onSystem);
      socket.off("message", onMessage);
      joinedRef.current = false;
    };
  }, [token]);

  /* ✅ AUTO SCROLL */
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isOpen]);


  /* SEND MESSAGE */
  const sendMessage = () => {
    if (!input.trim() || !conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("message:user", {
      conversationId,
      text: input,
    });

    setInput("");
  };

  return (
    <>
      <style>{`
        .chat-wrapper {
          position: fixed;
          bottom: 0;
          right: 80px;
          z-index: 9999;
        }

        .chat-toggle {
          margin-bottom: 12px;
          padding: 16px;
          border-radius: 50%;
          background-color: #7c3aed;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          transition: transform 0.2s ease;
        }

        .chat-toggle:hover {
          transform: scale(1.05);
        }

        .chat-box {
          width: 320px;
          height: 550px;
          background-color: #f3f4f6;
          border-radius: 16px;
          border: 1px solid #374151;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          padding: 16px;
          background-color: #1f2937;
          border-bottom: 1px solid #374151;
        }

        .chat-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }

        .chat-close {
          margin-left: auto;
          background: none;
          border: none;
          color: #d1d5db;
          font-size: 18px;
          cursor: pointer;
        }

        .chat-close:hover {
          color: white;
        }

        .chat-messages {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background-color: #111827;
        }

        .chat-message {
          padding: 8px 12px;
          border-radius: 12px;
          max-width: 75%;
          word-wrap: break-word;
        }

        .chat-message.user {
          background-color: #362060ff;/* blue */
          color: white;
          align-self: flex-end; /* left */
        }

        .chat-message.bot {
          background-color: #494b50ff; /* gray */
          color: white;
          align-self: flex-start; /* right */
        }

        .chat-input-area {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #374151;
          background-color: #1f2937;
        }

        .chat-input {
          flex: 1;
          padding: 8px;
          border-radius: 6px;
          border: none;
          background-color: #e5e7eb;
          outline: none;
        }

        .chat-send {
          padding: 8px 16px;
          background-color: #7c3aed;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .chat-send:hover {
          background-color: #6d28d9;
        }
      `}</style>

      <div className="chat-wrapper">
        <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
          <FiMessageSquare size={24} />
        </button>

        {isOpen && (
          <div className="chat-box">
            <div className="chat-header">
              <div className="chat-title">Brintelli AI</div>
              <button className="chat-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`chat-message ${m.sender === "bot" ? "bot" : "user"}`}
                >
                  <b>{m.sender}:</b> {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              <button className="chat-send" onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
