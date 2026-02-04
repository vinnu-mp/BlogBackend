import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Register endpoint ---> Pulls data from the user

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email }); //Prevent duplicate emails/users
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10); //Hash password for security

  const user = await User.create({
    //Save user in mongoDB
    name, //Same as name: name,
    email,
    password: hashed,
  });

  const token = jwt.sign(
    //Create JWT token for user
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.status(201).json({
    //Send token + safe user data to frontend
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

//----------------------------------------------
//Login endpoint ---> Pulls data from the user

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password); //Verify password
  if (!match) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

//----------------------------------------------
//Get current user endpoint ---> Pulls data from the user

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware

    const user = await User.findById(userId).select("_id name email"); //Only select safe fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error, could not retrieve user" });
  }
};
