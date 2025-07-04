// src/components/TopBar.jsx
import React from "react";
import styles from "../styles/TopBar.module.css";
import { FiLogOut } from "react-icons/fi";

const TopBar = ({ onLogout }) => {
  return (
    <div className={styles.topbar}>
      <div className={styles.logo}>⚡ AnyoneTalk</div>
      <div className={styles.actions}>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <FiLogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
