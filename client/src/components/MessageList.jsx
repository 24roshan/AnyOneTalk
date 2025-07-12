import React from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import styles from "../styles/ChatPage.module.css";
import socket from "../socket"; // ✅ Import socket

const MessageList = ({
  messages,
  getMessageById,
  handleReact,
  reactingToMsgId,
  handleSelectReaction,
  setReplyTo,
  handleForward,
}) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Delete handler
  const handleDelete = (id) => {
    if (window.confirm("Delete this message?")) {
      socket.emit("delete_message", { id });
    }
  };

  //  Edit handler
  const handleEdit = (id, currentContent) => {
    const newContent = prompt("Edit your message:", currentContent);
    if (newContent && newContent.trim() !== "") {
      socket.emit("edit_message", { id, newContent: newContent.trim() });
    }
  };

  return (
    <div className={styles.messageList}>
      {messages.map((msg) => {
        const isOwn = msg.senderId === user?.id;

        return (
          <div
            key={msg.id}
            className={`${styles.messageItem} ${
              isOwn ? styles.sent : styles.received
            }`}
          >
            {/*  Reply info */}
            {msg.replyTo && (
              <p className={styles.replyInfo}>
                Replying to: "
                {getMessageById(msg.replyTo)?.content || "Unknown"}"
              </p>
            )}
            {/*  Forward info */}
            {msg.isForwarded && (
              <p className={styles.forwardedInfo}>
                🔁 Forwarded from User {msg.originalSenderId}
              </p>
            )}
            {/*  Main message */}
            <strong>{isOwn ? "You" : `User ${msg.senderId}`}</strong>:{" "}
            {msg.deleted ? (
              <i className="text-gray-400 italic">[message deleted]</i>
            ) : (
              <>
                {msg.content}
                {msg.edited && (
                  <span className="text-yellow-400 text-xs italic ml-1">
                    (edited)
                  </span>
                )}
              </>
            )}
            {/* Reactions */}
            {msg.reactions && msg.reactions.length > 0 && (
              <p className={styles.reactions}> {msg.reactions.join(" ")}</p>
            )}
            {/* 🔧 Message Actions */}
            <div className={styles.messageActions}>
              {!msg.deleted && (
                <>
                  <button onClick={() => setReplyTo(msg)}>Reply</button>
                  <button onClick={() => handleReact(msg.id)}>React</button>
                  <button onClick={() => handleForward(msg)}>Forward</button>

                  {/*  Edit & 🗑️ Delete only for own messages */}
                  {isOwn && (
                    <>
                      <button onClick={() => handleEdit(msg.id, msg.content)}>
                         Edit
                      </button>
                      <button onClick={() => handleDelete(msg.id)}>
                         Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            {/*  Emoji Picker */}
            {reactingToMsgId === msg.id && (
              <div className={styles.emojiPickerWrapper}>
                <Picker
                  data={data}
                  onEmojiSelect={(emoji) => handleSelectReaction(emoji, msg.id)}
                  theme="dark"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
