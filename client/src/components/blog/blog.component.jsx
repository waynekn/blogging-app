import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {
  setBlogNotificationMessage,
  getBlog,
  handleBlogReaction,
} from "../../store/blog/blog.slice";
import { selectBlogPost } from "../../store/blog/blog.selector";
import Spinner from "../spinner/spinner.component";
import {
  BlogContainer,
  UserName,
  BlogTitle,
  BlogContent,
  ButtonContainer,
  LikeCount,
  LikeButton,
  DislikeButton,
  AuthorInfo,
  AuthorLink,
  MetaContainer,
} from "./blog.styles";

import "../editor/editor.styles.scss";

const Blog = () => {
  const dispatch = useDispatch();
  const { blogId } = useParams();
  const blog = useSelector(selectBlogPost);
  const [isLoading] = useState(blog.isLoading);
  const [datePosted, setDatePosted] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [userHasLikedBlog, setUserHasLikedBlog] = useState(false);
  const [userHasDislikedBlog, setUserHasDislikedBlog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Color,
      TextStyle,
      Underline,
      Subscript,
      Superscript,
    ],
    content: "",
    editable: false,
  });

  useEffect(() => {
    dispatch(getBlog(blogId))
      .unwrap()
      .then((blog) => {
        const datePosted = new Date(blog.datePosted);
        const date = `${datePosted.getDate()}`.padStart(2, "0");
        const month = `${datePosted.getMonth()}`.padStart(2, "0");
        const year = `${datePosted.getFullYear()}`;
        const formatedDate = `${date}/${month}/${year}`;
        setDatePosted(formatedDate);
        setLikeCount(blog.likeCount);
        setUserHasLikedBlog(blog.userHasLikedBlog);
        setUserHasDislikedBlog(blog.userHasDislikedBlog);
      })
      .catch((errorMessage) => {
        setBlogNotificationMessage(errorMessage);
      });
  }, [blogId, dispatch]);

  useEffect(() => {
    if (editor && blog.content) {
      editor.commands.setContent(blog.content);
    }
  }, [editor, blog.content]);

  const handleClick = (reaction) => {
    /**
     * When reaction === "like"
     * If a user likes a blog which they had previously liked, decrement likeCount by 1
     * if a user likes a blog which they haven't already liked, increment likeCount by 1.
     * If a user likes a blog they had disliked, increment likeCount by 2.
     *
     *  When reaction === "dislike"
     * If a user dislikes a blog they had previously disliked, increment likeCount by 1
     * If a user dislikes a blog they haven't aleardy disliked, decrement likeCount by 1.
     * If a user dislikes a blog they had previously liked, decrement likeCount by 2
     */
    let offset = 0;
    if (reaction === "like") {
      if (userHasLikedBlog) {
        setLikeCount(likeCount - 1);
        setUserHasLikedBlog(false);
        offset = -1;
      } else if (userHasDislikedBlog) {
        setLikeCount(likeCount + 2);
        setUserHasLikedBlog(true);
        offset = 2;
      } else {
        setLikeCount(likeCount + 1);
        setUserHasLikedBlog(true);
        offset = 1;
      }
      setUserHasDislikedBlog(false);
    } else {
      if (userHasDislikedBlog) {
        setLikeCount(likeCount + 1);
        setUserHasDislikedBlog(false);
        offset = 1;
      } else if (userHasLikedBlog) {
        setLikeCount(likeCount - 2);
        setUserHasDislikedBlog(true);
        offset = -2;
      } else {
        setLikeCount(likeCount - 1);
        setUserHasDislikedBlog(true);
        offset = 1;
      }
      setUserHasLikedBlog(false);
    }

    const handleBlogReactionPayload = {
      blogId,
      reaction,
    };

    dispatch(handleBlogReaction(handleBlogReactionPayload))
      .unwrap()
      .then((response) => {
        setLikeCount(response.likeCount);
        setUserHasLikedBlog(response.userHasLikedBlog);
        setUserHasDislikedBlog(response.userHasDislikedBlog);
      })
      .catch(() => {
        setLikeCount((prevCount) => prevCount - offset);
      });
  };

  if (isLoading) return <Spinner />;

  if (!editor) return <p>Couldn&apos;t get editor</p>;

  return (
    <BlogContainer>
      <BlogTitle>{blog.title}</BlogTitle>
      <AuthorInfo>
        <p>
          Author:
          <Link to={`../profile/${blog.userName}`}>
            <AuthorLink>{blog.userName}</AuthorLink>
          </Link>
        </p>
      </AuthorInfo>
      <MetaContainer>
        <UserName>{datePosted}</UserName>
      </MetaContainer>
      <BlogContent>
        <EditorContent editor={editor} />
      </BlogContent>
      <ButtonContainer>
        <LikeButton
          onClick={() => handleClick("like")}
          liked={userHasLikedBlog}
        >
          <i className="bi bi-hand-thumbs-up"></i>
        </LikeButton>
        <LikeCount>{likeCount}</LikeCount>
        <DislikeButton
          onClick={() => handleClick("dislike")}
          disliked={userHasDislikedBlog}
        >
          <i className="bi bi-hand-thumbs-down"></i>
        </DislikeButton>
      </ButtonContainer>
    </BlogContainer>
  );
};

export default Blog;
