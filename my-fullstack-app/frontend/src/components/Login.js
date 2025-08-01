import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { useQuery, useMutation, gql } from "@apollo/client";
import { FormStyled, ButtonStyled } from "../App.tsx";
import { TextField } from "@mui/material";

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        username
        createdAt
      }
    }
  }
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login] = useMutation(LOGIN_USER, {
    onCompleted: ( data ) => {
      console.log("DATA:", data);
      const { token, user } = data.login;

      localStorage.setItem("token", token);
      console.log("TOKEN SAVED:", token);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ variables: { email, password } });
      console.log("Login successful");
      console.log("currently logged in user:", email);
      // window.location.href = "/publications";
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <>
      <FormStyled onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          autoComplete="email"
          variant="outlined"
          margin="normal"
          fullWidth
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          name="password"
          autoComplete="new-password"
          variant="outlined"
          margin="normal"
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <ButtonStyled variant="contained" type="submit">
          Login
        </ButtonStyled>
      </FormStyled>
    </>
  );
}

export default Login;

