import React, { useState, useRef } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import styles from "../styles/ChatPage.module.css";
import { FaSmile, FaPaperPlane, FaFileUpload } from "react-icons/fa";

const MessageInput = ({
  newMsg,
  onChange,
  onSend,
  file,
  setFile,
  onUpload,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    const cursorPos = inputRef.current.selectionStart;
    const textBeforeCursor = newMsg.substring(0, cursorPos);
    const textAfterCursor = newMsg.substring(cursorPos);

    onChange({
      target: {
        value: textBeforeCursor + emoji.native + textAfterCursor,
      },
    });
  };

  return (
    <div className={styles.inputArea}>
   
      <button
        className={styles.emojiBtn}
        onClick={() => setShowEmojiPicker((prev) => !prev)}
      >
        <FaSmile />
      </button>

     
      {showEmojiPicker && (
        <div className={styles.pickerWrapper}>
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" />
        </div>
      )}

      <input
        ref={inputRef}
        value={newMsg}
        onChange={onChange}
        placeholder="Type a message..."
        className={styles.messageInput}
      />
      <label htmlFor="file-upload" className={styles.uploadLabel}>
        <FaFileUpload />
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className={styles.fileInput}
      />
      <button className={styles.sendBtn} onClick={onSend}>
        <FaPaperPlane />
      </button>
    </div>
  );
};

export default MessageInput;
