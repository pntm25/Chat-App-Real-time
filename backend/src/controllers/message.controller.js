import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import Group from "../models/group.model.js"
import cloudinary from "../lib/cloudinary.js"
import {getReceiverSocketId , io } from "../lib/socket.js"

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password")
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const getMessages = async (req, res) => {
    try {
        const {id : chatTargetId} = req.params
        const myId = req.user._id

        if (!myId) {
            return res.status(401).json({message: "User not authenticated"})
        }
        
        if (!chatTargetId) {
            return res.status(400).json({message: "Target ID parameter is required"})
        }

        // Check if the target is a Group
        const isGroup = await Group.findById(chatTargetId);

        let messages;
        if (isGroup) {
            // Fetch group messages
            messages = await Message.find({ groupId: chatTargetId })
                .populate("senderId", "fullName profilePic");
        } else {
            // Fetch direct messages
            messages = await Message.find({
                $or:[
                    {senderId: myId, receiverId: chatTargetId},
                    {senderId: chatTargetId, receiverId: myId}
                ]
            }).populate("senderId", "fullName profilePic");
            
            // Mark all unread messages from the other user as read
            await Message.updateMany(
                { senderId: chatTargetId, receiverId: myId, isRead: false },
                { $set: { isRead: true } }
            );

            // Notify the sender that messages have been read
            const senderSocketId = getReceiverSocketId(chatTargetId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesRead", { readerId: myId });
            }
        }

        res.status(200).json(messages)

    } catch (error) {
        console.error("Error in getMessages controller: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const sendMessages = async (req, res) => {
    try {
        const { text, image, voice } = req.body
        const { id: chatTargetId } = req.params
        const senderId = req.user._id
        
        let imageURL
        if(image){
            if(image.startsWith("http://") || image.startsWith("https://")){
                imageURL = image;
            } else {
                const uploadResponse = await cloudinary.uploader.upload(image)
                imageURL = uploadResponse.secure_url
            }
        }

        let voiceURL
        if(voice){
            const uploadResponse = await cloudinary.uploader.upload(voice, { resource_type: "auto" })
            voiceURL = uploadResponse.secure_url
        }

        // Check if the target is a Group
        const group = await Group.findById(chatTargetId);

        let newMessage;
        if (group) {
            newMessage = new Message({
                senderId,
                groupId: chatTargetId,
                text,
                image: imageURL,
                voice: voiceURL
            });
        } else {
            newMessage = new Message({
                senderId,
                receiverId: chatTargetId,
                text,
                image: imageURL,
                voice: voiceURL
            });
        }

        await newMessage.save();
        
        // Populate sender metadata so frontend has instant access
        await newMessage.populate("senderId", "fullName profilePic");

        if (group) {
            // Realtime: notify all group members
            group.members.forEach((memberId) => {
                const memberSocketId = getReceiverSocketId(memberId);
                if (memberSocketId) {
                    io.to(memberSocketId).emit("newMessage", newMessage);
                }
            });
        } else {
            // Realtime: notify both receiver and sender
            const receiverSocketId = getReceiverSocketId(chatTargetId);
            const senderSocketId = getReceiverSocketId(senderId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }
            if (senderSocketId && senderSocketId !== receiverSocketId) {
                io.to(senderSocketId).emit("newMessage", newMessage);
            }
        }

        res.status(200).json(newMessage)
    } catch (error) {
        console.error("Error in sendMessages controller: ", error.message)
        res.status(400).json({message: "Internal Server Error"})
    }
}

export const markMessagesAsRead = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        await Message.updateMany(
            { senderId: userToChatId, receiverId: myId, isRead: false },
            { $set: { isRead: true } }
        )

        const senderSocketId = getReceiverSocketId(userToChatId)
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", { readerId: myId })
        }

        res.status(200).json({ success: true })
    } catch (error) {
        console.error("Error in markMessagesAsRead: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}