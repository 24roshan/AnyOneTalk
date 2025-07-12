import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
const CreateGroupModal = ({ currentUser, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setAllUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = (userId, checked) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name cannot be empty.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/groups/create", {
        name: groupName,
        memberIds: selectedUsers,
        creatorId: currentUser.id,
      });

      alert("Group created successfully!");
      setGroupName("");
      setSelectedUsers([]);
      onClose();
      if (onGroupCreated) onGroupCreated();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-[400px] relative shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">
          Create Group
        </h2>

        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block font-semibold mb-2">Select Members</label>
        <div className="max-h-40 overflow-y-auto border rounded p-2 mb-4">
          {allUsers.map((user) => (
            <div key={user.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                value={user.id}
                onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                className="mr-2"
              />
              <span>{user.username}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCreateGroup}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Create
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
