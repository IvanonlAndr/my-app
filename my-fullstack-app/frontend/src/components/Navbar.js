import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar } from "@mui/material";
import { jwtDecode } from "jwt-decode";




function Navbar({user}) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            marginRight: "20px",
          }}
        >
          Home
        </Link>
        <Link
          to="/publications"
          style={{
            color: "white",
            textDecoration: "none",
            marginRight: "20px",
          }}
        >
          Publications
        </Link>
        <Link
          to="/login"
          style={{
            color: "white",
            textDecoration: "none",
            marginRight: "20px",
          }}
        >
          Login
        </Link>
        <Link to="/register" style={{ color: "white", textDecoration: "none" }}>
          Register
        </Link>

        {user ? (
          <span style={{ marginLeft: "1rem" }}>Welcome, {user.username}</span>
        ) : (
          <span style={{ marginLeft: "1rem" }}>Not logged in</span>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

