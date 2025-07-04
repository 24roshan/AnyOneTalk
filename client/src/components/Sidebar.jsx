import React from "react";
import styles from "../styles/ChatPage.module.css";

const Sidebar = ({ users, receiverId, setReceiverId }) => {
  return (
    <div className={styles.sidebar}>
      <h3>Users</h3>
      {users.map((u) => (
        <div
          key={u.id}
          className={`${styles.userItem} ${
            receiverId === u.id ? styles.activeUser : ""
          }`}
          onClick={() => setReceiverId(u.id)}
        >
          {u.username} (ID: {u.id})
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
