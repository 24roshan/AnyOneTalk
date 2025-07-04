import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import socket from "./socket";
import Sidebar from "./components/Sidebar";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import ForwardModal from "./components/ForwardModal";
import styles from "./styles/ChatPage.module.css";
import ProfileModal from "./components/ProfileModal";
import TopBar from "./components/TopBar";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [file, setFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [userList, setUserList] = useState([]);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [showProfile, setShowProfile] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));
  const typingTimeoutRef = useRef(null);

  const chatId =
    user?.id && receiverId
      ? user.id < receiverId
        ? `${user.id}_${receiverId}`
        : `${receiverId}_${user.id}`
      : null;

  useEffect(() => {
    if (!user) return;
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        const filtered = res.data.filter((u) => u.id !== user.id);
        setUserList(filtered);
      })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!socket.connected) {
      socket.connect();
      socket.emit("setup", user);
      socket.emit("user_connected", user);
    }

    socket.on("online_users", setOnlineUsers);

    socket.on("message received", (msg) => {
      if (!msg.chatId) return;

      setChatHistory((prev) => {
        const updated = [...(prev[msg.chatId] || []), msg];
        return { ...prev, [msg.chatId]: updated };
      });

      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", ({ userId }) => {
      if (userId !== user?.id) setTypingUser(`User ${userId} is typing...`);
    });

    socket.on("stop_typing", () => setTypingUser(null));

    return () => {
      socket.off("online_users");
      socket.off("message received");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [user, chatId]);

  useEffect(() => {
    if (!user || !receiverId) return;

    const newChatId =
      user.id < receiverId
        ? `${user.id}_${receiverId}`
        : `${receiverId}_${user.id}`;

    socket.emit("join_chat", { chatId: newChatId });

    setMessages(chatHistory[newChatId] || []);
  }, [receiverId]);

  useEffect(() => {
    if (!chatId) return;

    setChatHistory((prev) => ({
      ...prev,
      [chatId]: messages,
    }));
  }, [messages, chatId]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMsg(value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { chatId, userId: user.id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop_typing", { chatId, userId: user.id });
    }, 1500);
  };

  const handleSend = () => {
    if (!newMsg.trim()) return;

    const message = {
      chatId,
      senderId: user.id,
      content: newMsg,
      replyTo: replyTo?.id || null,
      isForwarded: false,
      originalSenderId: null,
      id: Date.now(),
    };

    socket.emit("send_message", message);

    setMessages((prev) => [...prev, message]);
    setChatHistory((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }));

    setNewMsg("");
    setReplyTo(null);
  };

  const handleReact = (msgId) => {
    const emoji = prompt("Enter emoji:");
    if (!emoji) return;

    const updated = messages.map((msg) =>
      msg.id === msgId
        ? { ...msg, reactions: [...(msg.reactions || []), emoji] }
        : msg
    );
    setMessages(updated);
    socket.emit("react_message", { msgId, emoji });
  };

  const handleForward = (msg) => {
    setForwardMessage(msg);
  };

  const handleForwardToUser = (targetId) => {
    if (!targetId) return;

    const newChatId =
      user.id < targetId ? `${user.id}_${targetId}` : `${targetId}_${user.id}`;

    const message = {
      ...forwardMessage,
      chatId: newChatId,
      senderId: user.id,
      id: Date.now(),
      isForwarded: true,
      originalSenderId: forwardMessage.senderId,
      replyTo: null,
    };

    socket.emit("send_message", message);

    setChatHistory((prev) => ({
      ...prev,
      [newChatId]: [...(prev[newChatId] || []), message],
    }));

    if (targetId === receiverId) {
      setMessages((prev) => [...prev, message]);
    }

    setForwardMessage(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("No file selected");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );
      alert(`File uploaded: ${data.url}`);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const getMessageById = (id) => messages.find((m) => m.id === id);

  return (
    <>
      <TopBar
        onLogout={() => {
          sessionStorage.clear();
          window.location.href = "/login";
        }}
      />
      <div className={styles.chatContainer}>
        <Sidebar
          users={userList}
          receiverId={receiverId}
          setReceiverId={setReceiverId}
        />
        <div className={styles.chatArea}>
          <div className={styles.header}>
            <button
              onClick={() => setShowProfile(true)}
              className={styles.profileBtn}
            >
              My Profile
            </button>

            <h3>Chat with: {receiverId || "Select a user"}</h3>
            <p>Chat ID: {chatId}</p>
            <p>
              Online: {onlineUsers.map((u) => u.username).join(", ") || "None"}
            </p>
            {typingUser && <p className={styles.typing}>{typingUser}</p>}
          </div>

          <MessageList
            messages={messages}
            getMessageById={getMessageById}
            handleReact={handleReact}
            handleForward={handleForward}
            setReplyTo={setReplyTo}
          />

          <MessageInput
            newMsg={newMsg}
            onChange={handleInputChange}
            onSend={handleSend}
            file={file}
            setFile={setFile}
            onUpload={handleUpload}
          />
        </div>

        {showProfile && (
          <ProfileModal user={user} onClose={() => setShowProfile(false)} />
        )}

        {forwardMessage && (
          <ForwardModal
            users={userList}
            onSelect={handleForwardToUser}
            onClose={() => setForwardMessage(null)}
          />
        )}
      </div>
    </>
  );
};

export default ChatPage;
