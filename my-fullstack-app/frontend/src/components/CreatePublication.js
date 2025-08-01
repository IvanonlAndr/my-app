import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { FormStyled, ButtonStyled } from "../App.tsx";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CREATE_PUBLICATION = gql`
  mutation CreatePost($values: PostInput!) {
    createPost(values: $values) {
      id
      title
      description
      message
    }
  }
`;

function CreatePublication() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    message: "",
  });

  const [createPost] = useMutation(CREATE_PUBLICATION, {
    update(cache, { data: { createPost } }) {
      cache.modify({
        fields: {
          getAllPosts(existingPosts = []) {
            const newPostRef = cache.writeFragment({
              data: createPost,
              fragment: gql`
                fragment NewPost on Post {
                  id
                  title
                  description
                  message
                }
              `,
            });
            return [...existingPosts, newPostRef];
          },
        },
      });
    },
    onError(err) {
      console.error("Create post failed:", err.message);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost({ variables: { values: formData } });
      console.log("Post created!");
      navigate("/publications");
    } catch (err) {
      console.error("Failed to create post:", err.message);
    }
  };

  return (
    <FormStyled onSubmit={handleSubmit}>
      <TextField
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <TextField
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <TextField
        name="message"
        label="Message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <ButtonStyled type="submit">
        Create Post
      </ButtonStyled>
    </FormStyled>
  );
}

export default CreatePublication;
