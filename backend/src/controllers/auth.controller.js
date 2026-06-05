import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"
import crypto from "crypto";
import { sendResetPasswordEmail } from "../lib/email.js";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body
    try {
        if(!fullName || !email || !password){
            res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6){
            return res.status(400).json( { message: "Password must be atleast 6 characters"} )
        }

        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message: "Email already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        })

        if(newUser){
            //Generate JWT token here
            generateToken(newUser._id, res)
            await newUser.save()
            res.status(200).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                message: "User created successfully"
            })
        }
        else{
            res.status(400).json({message: "Invalid User Data"})
        }
    } catch (error) {
        console.log("Error in singup controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"})
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"})
        }
        generateToken(user._id, res)
        res.status(200).json({
            _id:user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            message: "Login successful"
        })
        
    } catch (error) {
        console.log("Error in auth controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0})
        res.status(200).json({message: "Logged out successfully!"})

    } catch (error) {
        console.log("Error in auth controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body
        const userId = req.user._id

        if(!profilePic){
            return res.status(400).json({message: "Profile Pic is required!"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true})
        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error in updating profile pic")
        res.status(500).json({message: "Internal Server Error"})
    }
};

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

        // Send email
        const emailResult = await sendResetPasswordEmail(email, resetLink);

        // In development mode, if it's fallback (SMTP not configured), return the link in response
        if (process.env.NODE_ENV === "development" && emailResult.fallback) {
            return res.status(200).json({
                message: "Password reset link generated. Since SMTP is not configured, you can test using the link below.",
                resetLink: resetLink,
                isDev: true
            });
        }

        res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error) {
        console.log("Error in forgotPassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired password reset token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear token fields
        user.password = hashedPassword;
        user.resetPasswordToken = "";
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error) {
        console.log("Error in resetPassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};