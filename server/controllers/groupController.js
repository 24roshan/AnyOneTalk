import db from "../config/db.js";

export const createGroupChat = async (req, res) => {
  const { name, memberIds, creatorId, avatarUrl } = req.body;

  try {
    const [groupResult] = await db.execute(
      "INSERT INTO `groups` (name, avatar_url, creator_id) VALUES (?, ?, ?)",
      [name, avatarUrl || null, creatorId]
    );

    const groupId = groupResult.insertId;

    // Add members
    for (const userId of memberIds) {
      await db.execute(
        "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
        [groupId, userId]
      );
    }

    res.status(201).json({ message: "Group created", groupId });
  } catch (error) {
    console.error("Group creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getUserGroups = async (req, res) => {
  const userId = req.params.userId;
  console.log("📦 Fetching groups for user ID:", userId);

  try {
    const [rows] = await db.execute(
      `SELECT g.id, g.name, g.avatar_url, g.creator_id, g.created_at
       FROM group_members gm
       JOIN \`groups\` g ON gm.group_id = g.id
       WHERE gm.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ SQL ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


