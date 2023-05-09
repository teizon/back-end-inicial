import mongoose from "@/database";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({  
    name: { 
        type: String,
        required: true,
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: { 
        type: String,
        required: true,
        select: false
    },
    createdAt: { 
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('user', UserSchema);