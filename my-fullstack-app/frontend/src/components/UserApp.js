import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { FormStyled, ButtonStyled } from "../App.tsx";
import { TextField } from "@mui/material";

const SEND_EMAIL = gql`
  mutation SendEmail($email: String!) {
    sendEmail(email: $email) {
      message
      emails
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($values: UserValues!) {
    createUser(values: $values) {
      id
      email
      username
      createdAt
    }
  }
`;

function UserApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      setEmail("");
      setPassword("");
      setUsername("");
      alert("User created successfully: " + data.createUser.email);
    },
    onError: (error) => {
      alert("Failed to create user: " + error.message);
    },

    update(cache, { data: { createUser } }) {
      cache.modify({
        fields: {
          getUsers(existingUsers = []) {
            const newUserRef = cache.writeFragment({
              data: createUser,
              fragment: gql`
                fragment NewUser on User {
                  id
                  email
                  username
                  createdAt
                }
              `,
            });
            return [...existingUsers, newUserRef];
          },
        },
      });
    }
  });

  const [sendEmail, { loading: sendingEmail }] = useMutation(SEND_EMAIL, {
    onCompleted: (data) => {
      setEmail("");
    },
    onError: (error) => {
      alert("Failed to send email: " + error.message);
    },
    // Update Apollo cache with new emails list from mutation result
    update(cache, { data: { sendEmail } }) {
      cache.modify({
        fields: {
          getEmails(existingEmails = []) {
            return [...existingEmails, sendEmail.email];
          },
        },
      });
    },
  });

  const handleClick = () => {
    if (email.trim() === "") return alert("Please enter an email");
    createUser({ variables: { values: { email, password, username } } });
    sendEmail({ variables: { email } });
  };

  return (
    <FormStyled>
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

      <TextField
        label="Username" 
        name="username"
        autoComplete="username"
        variant="outlined"
        margin="normal"
        required
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <ButtonStyled
        variant="contained"
        onClick={handleClick}
        disabled={sendingEmail}
      >
        {sendingEmail ? "Sending..." : "Send"}
      </ButtonStyled>
    </FormStyled>
  );
}

export default UserApp;
