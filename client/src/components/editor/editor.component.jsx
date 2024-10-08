import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";

import BubbleMenuComponent from "./modules/bubble-menu/bubble-menu";
import Toolbar from "./modules/toolbar/toolbar.component";

import MessageToast from "../toast/toast.component";

import {
  postBlog,
  setBlogNotificationMessage,
  clearBlogNotificationMessage,
} from "../../store/blog/blog.slice";
import { selectBlogPost } from "../../store/blog/blog.selector";
import { selectCurrentUser } from "../../store/user/user.selector";

import "./editor.styles.scss";

const extensions = [
  StarterKit,
  Color,
  TextStyle,
  Underline,
  Subscript,
  Superscript,
  CodeBlock,
  Code,
];

const Editor = () => {
  const [title, setTitle] = useState("");
  const disptach = useDispatch();
  const blog = useSelector(selectBlogPost);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const editor = useEditor({
    extensions,
  });

  if (!editor) return null;

  const handlePost = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      disptach(setBlogNotificationMessage("Post must have a title"));
      return;
    }

    /**
     * validate whether the editor has text or not using the plain string returned from getText()
     * as it's difficult to know this from the HTML or JSON representation of the editor.
     */
    const textContent = editor.getText().trim();
    if (!textContent) {
      return disptach(setBlogNotificationMessage("Blog is empty."));
    }

    const blogContent = editor.getHTML();
    const doc = {
      title: trimmedTitle,
      blogContent,
    };
    disptach(postBlog(doc))
      .unwrap()
      .then(() => {
        disptach(clearBlogNotificationMessage());
        navigate(`../profile/${currentUser.userName}`);
      })
      .catch((errorMessage) =>
        disptach(setBlogNotificationMessage(errorMessage))
      );
  };

  return (
    <div className="editor-container">
      <button onClick={handlePost}>Post</button>
      <input
        type="text"
        placeholder="Title"
        className="editor-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="editor-content">
        <Toolbar editor={editor} />
        <BubbleMenuComponent editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {blog.notification && <MessageToast message={blog.notification} />}
    </div>
  );
};

export default Editor;
