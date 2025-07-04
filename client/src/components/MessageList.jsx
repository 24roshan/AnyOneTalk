import React from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import styles from "../styles/ChatPage.module.css";

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
            {msg.replyTo && (
              <p className={styles.replyInfo}>
                Replying to: "
                {getMessageById(msg.replyTo)?.content || "Unknown"}"
              </p>
            )}
            {msg.isForwarded && (
              <p className={styles.forwardedInfo}>
                🔁 Forwarded from User {msg.originalSenderId}
              </p>
            )}
            <strong>User {msg.senderId}</strong>: {msg.content}
            {msg.reactions && msg.reactions.length > 0 && (
              <p className={styles.reactions}>❤️ {msg.reactions.join(" ")}</p>
            )}
            <div className={styles.messageActions}>
              <button onClick={() => setReplyTo(msg)}>Reply</button>
              <button onClick={() => handleReact(msg.id)}>React</button>
              <button onClick={() => handleForward(msg)}>Forward</button>
            </div>
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
