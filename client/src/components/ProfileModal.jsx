import React from "react";
import styles from "../styles/ProfileModal.module.css";
import { useNavigate } from "react-router-dom";

const ProfileModal = ({ user, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>👤 My Profile</h2>
        <p>
          <strong>ID:</strong> {user?.id}
        </p>
        <p>
          <strong>Username:</strong> {user?.username}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "N/A"}
        </p>

        <button
          onClick={() => {
            sessionStorage.clear();
            navigate("/login"); 
          }}
        >
          Logout
        </button>

        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
