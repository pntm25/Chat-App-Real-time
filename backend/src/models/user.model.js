import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
        },
        fullName:{
            type: String,
            required: true,
        },
        password:{
            type: String,
            required: true,
            minLength: 6,
        },
        profilePic:{
            type: String,
            default: "",
        },
        resetPasswordToken:{
            type: String,
            default: "",
        },
        resetPasswordExpires:{
            type: Date,
            default: null,
        }
    },
    {
        timestamps: true
    }
);

const user = mongoose.model("User", userSchema);

export default user