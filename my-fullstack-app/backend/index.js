require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("nodemailer");
const { ApolloServer, gql } = require("apollo-server-express");
const { v4: uuidv4 } = require("uuid");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const { get } = require("http");
const jwt = require("jsonwebtoken");

app.use(cors());

const typeDefs = gql`
  type Query {
    getEmails: [String!]!
  }

  type Mutation {
    sendEmail(email: String!): SendEmailResponse!
  }

  type SendEmailResponse {
    message: String!
    emails: [String!]!
  }
`;

const typeDefsPosts = gql`
  type Query {
    getPost(id: String!): Post
    getAllPosts: [Post!]!
  }

  type Mutation {
    createPost(values: PostInput): Post!
  }

  type Post {
    id: String!
    title: String!
    description: String!
    message: String!
  }

  input PostInput {
    title: String!
    description: String!
    message: String!
  }
`;

const typeDefsUsers = gql`
  type Query {
    getUsers: [User!]!
    getUserByID(id: ID!): User
    getUserByEmail(email: String!): User
  }

  type Mutation {
    createUser(values: UserValues): User!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
  }

  input UserValues {
    email: String!
    password: String!
    username: String!
  }
`;

const typeDefsLogin = gql`
  type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
  }

  type Query {
    getUsers: [User!]!
  }
`;

async function startApolloServer() {
  // 1. Open database
  const db = await sqlite.open({
    filename: "mydatabase.sqlite",
    driver: sqlite3.Database,
  });

  // 2. Create table if not exists
  await db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    username TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

  await db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT UNIQUE PRIMARY KEY,
      title TEXT,
      description TEXT,
      message TEXT
  )
  `);

  // 3. Attach db to resolvers (closure or context)
  const resolvers = {
    Query: {
      getEmails: async () => {
        const rows = await db.all(`SELECT email FROM users`);
        return rows.map((row) => row.email);
      },

      getPost: async (id) => {
        const post = await db.get(`SELECT * FROM posts WHERE id = ?`, [id]);

        if (!post) {
          throw new Error("Post not found");
        }

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          message: post.message,
        };
      },

      getAllPosts: async () => {
        const posts = await db.all(`SELECT * FROM posts`);
        return posts.map((post) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          message: post.message,
        }));
      },

      getUsers: async () => {
        const rows = await db.all(`SELECT * FROM users`);
        return rows.map((row) => ({
          id: row.id,
          email: row.email,
          username: row.username,
          createdAt: row.createdAt,
        }));
      },

      getUserByID: async (_, { id }) => {
        const user = await db.get(`SELECT * FROM users WHERE id = ?`, [id]);
        if (!user) {
          throw new Error("User not found");
        }
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        };


      },

      getUserByEmail: async (_, { email }) => {
        const user = await db.get(`SELECT * FROM users WHERE email = ?`, [
          email,
        ]);
        if (!user) {
          throw new Error("User not found");
        }
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        };
      },
    },

    Mutation: {
      sendEmail: async (_, { email }) => {
        if (!email.trim()) {
          throw new Error("Email must not be empty");
        }

        try {
          await db.run(`INSERT OR IGNORE INTO users (email) VALUES (?)`, [
            email,
          ]);

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: '"Ivan Komissarov" <komivan06@gmail.com>',
            to: email,
            subject: "Hello ✔",
            text: "Hello world?",
            html: `<b>Hello world?</b><a href="http://bit.ly/44IHQsY"><button>asd</button></a>`,
          });

          const rows = await db.all(`SELECT email FROM users`);
          const allEmails = rows.map((row) => row.email);

          return {
            message: "Email Sent!",
            emails: allEmails,
          };
        } catch (error) {
          console.error("Error sending email:", error);
          throw new Error("Email send failed");
        }
      },

      createPost: async (_, { values }) => {
        const { title, description, message } = values;
        const id = uuidv4();

        // Check for existing post
        const exists = await db.get(`SELECT * FROM posts WHERE id = ?`, [id]);
        if (exists) {
          throw new Error("Post with this ID already exists");
        }

        // Insert into DB
        await db.run(
          `INSERT INTO posts (id, title, description, message) VALUES (?, ?, ?, ?)`,
          [id, title, description, message]
        );

        // Return the newly created post
        return {
          id,
          title,
          description,
          message,
        };
      },

      createUser: async (_, { values }) => {
        const { email, password, username } = values;
        const createdAt = new Date().toISOString();
        const id = uuidv4();
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        const exists = await db.get(`SELECT * FROM users WHERE email = ?`, [
          email,
        ]);
        if (exists) {
          throw new Error("User with this email already exists");
        }
        const columns = await db.all(`PRAGMA table_info(users)`);
        console.log(columns);
        await db.run(
          `INSERT INTO users (id, email, password, username, createdAt) VALUES (?, ?, ?, ?, ?)`,
          [id, email, password, username, createdAt]
        );
        return {
          id,
          email,
          password,
          username,
          createdAt,
        };
      },

      login: async (_, { email, password }) => {
        const user = await db.get(`SELECT * FROM users WHERE email = ?`, [
          email,
        ]);
        if (!user || user.password !== password) {
          throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
          {
            userId: user.id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return {
          token,
          user,
        };
      },
    },
  };

  const server = new ApolloServer({
    typeDefs: [typeDefs, typeDefsPosts, typeDefsUsers, typeDefsLogin],
    resolvers,
    context: ({ req }) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer ", "");

      if (!token) return {}; // No token, unauthenticated context

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded }; // attach user info to context
      } catch (err) {
        console.log("JWT verification error:", err.message);
        return {}; // optionally throw or handle unauthorized here
      }
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(
      `Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startApolloServer();

