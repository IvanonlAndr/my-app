import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { FormStyled, ButtonStyled } from "../App.tsx";
import { TextField } from "@mui/material";

const GET_EMAILS = gql`
  query GetEmails {
    emails
  }
`;

const SEND_EMAIL = gql`
  mutation SendEmail($email: String!) {
    sendEmail(email: $email) {
      message
      emails
    }
  }
`;


function EmailSend() {
  const [email, setEmail] = useState("");
  const { loading: loadingEmails, data } = useQuery(GET_EMAILS);

  const [sendEmail, { loading: sendingEmail }] = useMutation(SEND_EMAIL, {
    onCompleted: (data) => {
      setEmail("");
    },
    onError: (error) => {
      alert("Failed to send email: " + error.message);
    },
    // Update Apollo cache with new emails list from mutation result
    update(cache, { data: { sendEmail } }) {
      cache.writeQuery({
        query: GET_EMAILS,
        data: { emails: sendEmail.emails },
      });
    },
  });

    const handleClick = () => {
    if (email.trim() === "") return alert("Please enter an email");
    sendEmail({ variables: { email } });
  };

  const emails = data?.emails || [];

  return (
    <FormStyled>
      <TextField
        label="Email"
        variant="outlined"
        margin="normal"
        fullWidth
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <ButtonStyled variant="contained" onClick={handleClick} disabled={sendingEmail}>
        {sendingEmail ? "Sending..." : "Send"}
      </ButtonStyled>

      {loadingEmails ? (
        <p>Loading emails...</p>
      ) : emails.length > 0 ? (
        <ul>
          {emails.map((email, i) => (
            <li key={i}>{email}</li>
          ))}
        </ul>
      ) : (
        <p>No Emails</p>
      )}
    </FormStyled>
  );
}

export default EmailSend;
