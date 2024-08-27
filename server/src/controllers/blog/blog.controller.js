import {
  checkExistingTitle,
  uploadBlog,
  fetchBlogContent,
  fetchBlogTitles,
} from "../../models/blog/blog.model.js";
import { fetchUserProfile } from "../../models/user/user.model.js";

export const postBlog = async (req, res) => {
  try {
    const authorId = req.user.id;
    const title = req.body.title;
    const content = req.body.htmlContent;

    const existingTitle = await checkExistingTitle(authorId, title);

    if (existingTitle) {
      return res.status(404).json({ error: "Can't have duplicate titles" });
    }

    const { displayName } = await fetchUserProfile(authorId);
    await uploadBlog(authorId, displayName, title, content);
    res.status(201).json({ message: "Post successfuly uploaded" });
  } catch (error) {
    if (error.name && error.name === "MongoError") {
      return res.status(500).json({ error: "A database error occurred" });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
};

export const getBlogTitles = async (req, res) => {
  const authorId = req.user.id;
  try {
    const titles = await fetchBlogTitles(authorId);
    return res.status(200).json({ titles });
  } catch (error) {
    return res.status(500).json({ error: "Couldn't get titles" });
  }
};

export const getBlogContent = async (req, res) => {
  try {
    const title = req.body.title;
    const authorId = req.user.id;
    const blog = await fetchBlogContent(authorId, title);
    res.status(200).json({ blog });
  } catch (error) {
    res.status(500).json({ error: "A server errror occured" });
  }
};
