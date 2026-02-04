import express from "express";
import {
  createPost,
  getPosts,
  getOnePost,
  deletePost,
  updatePost,
  getMyPosts,
} from "../controllers/post.controller.js";

import { updatePostStatus } from "../controllers/updatePostStatus.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.get("/me", authMiddleware, getMyPosts);
router.get("/:id", getOnePost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id/status", authMiddleware, updatePostStatus);

export default router;
