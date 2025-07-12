// Sidebar.jsx
import React from "react";
import styles from "../styles/Sidebar.module.css";

const Sidebar = ({
  users,
  receiverId,
  setReceiverId,
  currentUserId,
  groups,
  selectedGroup,
  setSelectedGroup,
}) => {
  const handleUserClick = (id) => {
    setReceiverId(id);
    setSelectedGroup(null); // deselect group
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setReceiverId(null); // deselect individual chat
  };

  return (
    <div className={styles.sidebar}>
      <h3>Users</h3>
      {users.map((user) => (
        <div
          key={user.id}
          className={`${styles.userItem} ${
            receiverId === user.id ? styles.active : ""
          }`}
          onClick={() => handleUserClick(user.id)}
        >
          👤 {user.username}
        </div>
      ))}

      <hr />

      <h3>Groups</h3>
      {groups.length === 0 && <p className={styles.empty}>No groups yet</p>}
      {groups.map((group) => (
        <div
          key={group.id}
          className={`${styles.userItem} ${
            group.id === (selectedGroup?.id || null) ? styles.active : ""
          }`}
          onClick={() => handleGroupClick(group)}
        >
          👥 {group.name}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
