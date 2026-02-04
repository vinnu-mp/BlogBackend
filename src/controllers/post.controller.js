import mongoose from "mongoose";
import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

export const createPost = async (req, res) => {
  const { title, content, featuredImage, featuredImageId, status } = req.body;
  if (!title || !content || title.trim() === "" || content.trim() === "") {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const userId = req.user.id; // Assuming user ID is available in req.user---> get from token after user logs in

  try {
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      featuredImage: featuredImage || "",
      featuredImageId: featuredImageId || "",
      status: status || "draft",
      userId,
    });

    res.status(201).json({ post }); // Return the created post as response
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error, couldn't add post" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" }).sort({
      createdAt: -1,
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error, couldn't fetch posts" });
  }
};

export const getOnePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      //It prevents --> Mongo crashes on bad IDs
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error, couldn't fetch post" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      // Check if the logged-in user is the owner of the post
      return res.status(403).json({ message: "Not authorized" });
    }

    if (post.featuredImageId) {
      await cloudinary.uploader.destroy(post.featuredImageId);
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error, couldn't delete post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, featuredImage, featuredImageId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //Imp ---------------------------------------------------------------

    // ---- TEXT FIELDS ----
    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (status) post.status = status;

    // ---- IMAGE LOGIC (THE IMPORTANT PART) ----

    // CASE 2 or 3: user touched the image field
    if (featuredImageId !== undefined) {
      // delete old image if it exists
      if (post.featuredImageId) {
        await cloudinary.uploader.destroy(post.featuredImageId);
      }

      // set new values (can be "" or new ones)
      post.featuredImage = featuredImage || "";
      post.featuredImageId = featuredImageId || "";
    }

    const updatedPost = await post.save();

    res.status(200).json({ post: updatedPost });
    //-------------------------------------------------------------------------
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error, couldn't update post" });
  }
};

//For My posts
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get my posts error:", error);
    res
      .status(500)
      .json({ message: "Server error, couldn't fetch your posts" });
  }
};
