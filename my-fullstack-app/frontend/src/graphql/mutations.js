import { gql } from "@apollo/client";
export const SEND_EMAIL = gql`
  mutation SendEmail($email: String!) {
    sendEmail(email: $email) {
      message
      emails
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($values: UserValues!) {
    createUser(values: $values) {
      id
      email
      username
      createdAt
    }
  }
`;

