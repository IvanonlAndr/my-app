// src/hooks/useSignupMutations.js
import { useMutation, gql } from "@apollo/client";
import { SEND_EMAIL, CREATE_USER } from "../graphql/mutations.js";

export function useSignupMutations({ onUserCreated }) {
  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      onUserCreated?.(data.createUser);
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
    },
  });

  const [sendEmail, { loading: sendingEmail }] = useMutation(SEND_EMAIL, {
    onError: (error) => {
      alert("Failed to send email: " + error.message);
    },
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

  return { createUser, sendEmail, sendingEmail };
}