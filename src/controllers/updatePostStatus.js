export const updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const post = await post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.status = status;
    const updatedPost = await post.save();

    res.status(200).json({ post: updatedPost });
  } catch (error) {
    console.error("Update post status error:", error);
    res
      .status(500)
      .json({ message: "Server error, couldn't update post status" });
  }
};
