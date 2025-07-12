import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateGroup = ({ currentUserId }) => {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");

  //  Get all users to select from
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users") // Adjust if needed
      .then((res) => setUsers(res.data))
      .catch((err) => console.log("Error fetching users", err));
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUserIds.length === 0) {
      alert("Please provide group name and select members.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/groups/create", {
        name: groupName,
        memberIds: selectedUserIds,
        creatorId: currentUserId,
        avatarUrl,
      });

      alert("Group created successfully!");
      setGroupName("");
      setSelectedUserIds([]);
      setAvatarUrl("");
      onClose();
      if (onGroupCreated) onGroupCreated();
    } catch (err) {
      console.error("Error creating group", err);
      alert(" Failed to create group.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create New Group</h2>

      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="Avatar URL (optional)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
      />

      <h3 className="font-medium mb-2">Select Members:</h3>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user.id)}
            className={`px-3 py-1 rounded border ${
              selectedUserIds.includes(user.id)
                ? "bg-green-500 text-white"
                : "bg-gray-100"
            }`}
          >
            {user.username}
          </button>
        ))}
      </div>

      <button
        onClick={handleCreateGroup}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Group
      </button>
    </div>
  );
};

export default CreateGroup;
