import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { jwtDecode } from "jwt-decode";

export default function MainLayout() {
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch {
      localStorage.removeItem("token");
    }
  }

  useEffect(() => {
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      localStorage.removeItem("token");
      return;
    }

    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return;
    }

    const timeLeft = (decoded.exp - currentTime) * 1000;
    const timeoutId = setTimeout(() => {
      localStorage.removeItem("token");
      // optional: trigger a reload or redirect here
    }, timeLeft);

    return () => clearTimeout(timeoutId);
  }, [token]);

  const GET_USER_BY_ID = gql`
    query GetUserById($id: ID!) {
      getUserByID(id: $id) {
        id
        email
        username
        createdAt
      }
    }
  `;

  const { loading, error, data } = useQuery(GET_USER_BY_ID, {
    skip: !userId, // skip query if no userId
    variables: { id: userId },
    onCompleted: (data) => {
      console.log("User data:", data.getUserByID.username);
    },
    onError: (error) => {
      console.error("Error fetching user:", error.message);
    },
  });

  return (
    <>
      <Navbar user={data?.getUserByID} />
      <main>
        <Outlet />
      </main>
    </>
  );
}

