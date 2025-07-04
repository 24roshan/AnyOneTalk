import React from "react";
import styles from "../styles/ChatPage.module.css";

const ForwardModal = ({ users, onSelect, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Select a user to forward message:</h3>
        <ul className={styles.userList}>
          {users.map((user) => (
            <li key={user.id}>
              <button onClick={() => onSelect(user.id)}>{user.username}</button>
            </li>
          ))}
        </ul>
        <button className={styles.closeModalBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ForwardModal;
