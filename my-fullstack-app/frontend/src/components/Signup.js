import React, { useState } from "react";
import { useSignupMutations } from "../hooks/useSignupMutations.js";
import { FormStyled, ButtonStyled } from "../App.tsx";
import { TextField } from "@mui/material";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const { createUser, sendEmail, sendingEmail } = useSignupMutations({
    onUserCreated: (user) => {
      setEmail("");
      setPassword("");
      setUsername("");
      alert("User created successfully: " + user.email);
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

export default Signup;
