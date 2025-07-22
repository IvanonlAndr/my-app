import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { FormStyled, ButtonStyled } from "../App.tsx";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

const GET_PUBLICATION = gql`
  query GetPost($id: String!) {
    getPost(id: $id) {
      title
      description
      message
    }
  }
`;

const GET_PUBLICATIONS = gql`
  query GetAllPosts {
    getAllPosts {
      id
      title
      description
      message
    }
  }
`;

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

  const [createPost] = useMutation(CREATE_PUBLICATION);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost({ variables: { values: formData } });
      console.log("Post created!");
      navigate("/publications");
      setTimeout(() => {
        window.location.reload();
      }, 100);
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
      <ButtonStyled type="submit" onClick={handleSubmit}>
        Create Post
      </ButtonStyled>
    </FormStyled>
  );
}

export default CreatePublication;
