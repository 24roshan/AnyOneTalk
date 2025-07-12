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
import CreateGroupModal from "./components/CreateGroupModal";

const ChatPage = () => {
  const user = JSON.parse(sessionStorage.getItem("user")); // ✅ defined once

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
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);

  const typingTimeoutRef = useRef(null);

  const chatId = selectedGroup?.id
    ? `group_${selectedGroup.id}`
    : user?.id && receiverId
    ? user.id < receiverId
      ? `${user.id}_${receiverId}`
      : `${receiverId}_${user.id}`
    : null;

  //  Get all users except self
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

  // Fetch groups only once on mount
  useEffect(() => {
    if (!user?.id) return;
    console.log("📦 Fetching groups for user ID:", user.id);
    axios
      .get(`http://localhost:5000/api/groups/user/${user.id}`)
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Error fetching groups:", err));
  }, [user?.id]);

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
    if (!user || (!receiverId && !selectedGroup)) return;

    const newChatId = selectedGroup
      ? `group_${selectedGroup.id}`
      : user.id < receiverId
      ? `${user.id}_${receiverId}`
      : `${receiverId}_${user.id}`;

    socket.emit("join_chat", { chatId: newChatId });
    setMessages(chatHistory[newChatId] || []);
  }, [receiverId, selectedGroup]);

  useEffect(() => {
    if (!chatId) return;
    setChatHistory((prev) => ({
      ...prev,
      [chatId]: messages,
    }));
  }, [messages, chatId]);

  useEffect(() => {
    socket.on("messageEdited", ({ id, newContent }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, content: newContent, edited: true } : msg
        )
      );
    });

    socket.on("messageDeleted", ({ id }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, deleted: true } : msg))
      );
    });
  }, []);

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
      isGroup: !!selectedGroup,
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

  const handleEditMessage = async (id, currentContent) => {
    const newContent = prompt("Edit your message:", currentContent);
    if (!newContent || newContent.trim() === "") return;

    try {
      await axios.put(`http://localhost:5000/api/messages/${id}`, {
        newContent,
      });
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const handleDeleteMessage = async (id) => {
    const confirmDelete = window.confirm("Delete this message?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/messages/${id}`);
    } catch (err) {
      console.error("Delete error:", err);
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
          currentUserId={user.id}
          selectedGroup={selectedGroup} // ✅ Added
          setSelectedGroup={setSelectedGroup}
          groups={groups}
        />

        <div className={styles.chatArea}>
          <div className={styles.header}>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className={styles.profileBtn}
            >
              ➕ Create Group
            </button>

            <button
              onClick={() => setShowProfile(true)}
              className={styles.profileBtn}
            >
              My Profile
            </button>

            {showCreateGroupModal && (
              <CreateGroupModal
                users={userList}
                currentUser={user}
                onClose={() => setShowCreateGroupModal(false)}
                onGroupCreated={() => {
                  console.log(" Refetching groups...");
                  axios
                    .get(`http://localhost:5000/api/groups/user/${user.id}`)
                    .then((res) => setGroups(res.data))
                    .catch(console.error);
                }}
              />
            )}

            <h3>
              Chat with:{" "}
              {selectedGroup
                ? `Group - ${selectedGroup.name}`
                : receiverId
                ? `User ${receiverId}`
                : "Select a chat"}
            </h3>
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
            handleEditMessage={handleEditMessage}
            handleDeleteMessage={handleDeleteMessage}
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
