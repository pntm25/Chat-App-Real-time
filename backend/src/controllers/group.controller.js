import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members, groupPic } = req.body;
    const creatorId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Parse members: it should be an array of IDs.
    let memberIds = [];
    if (members) {
      memberIds = typeof members === "string" ? JSON.parse(members) : members;
    }

    // Always ensure the creator is a member of their own group
    if (!memberIds.includes(String(creatorId))) {
      memberIds.push(creatorId);
    }

    let groupPicUrl = "";
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      groupPicUrl = uploadResponse.secure_url;
    }

    const newGroup = new Group({
      name: name.trim(),
      description: description || "",
      creator: creatorId,
      members: memberIds,
      groupPic: groupPicUrl,
    });

    await newGroup.save();

    // Populate members and creator details for returning
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("members", "_id fullName email profilePic")
      .populate("creator", "_id fullName email profilePic");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "_id fullName email profilePic")
      .populate("creator", "_id fullName email profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
