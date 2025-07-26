const express = require("express");
const cors = require("cors");
const { data, dataOfPost, loadData } = require("./dataStore");
const app = express();
const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("nodemailer");
const { ApolloServer, gql } = require("apollo-server-express");
const { v4: uuidv4 } = require("uuid");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(cors());

const typeDefs = gql`
  type Query {
    emails: [String!]!
  }

  type Mutation {
    sendEmail(email: String!): SendEmailResponse!
  }

  type SendEmailResponse {
    message: String!
    email: String!
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

async function startApolloServer() {
  // 1. Open database
  const db = await sqlite.open({
    filename: "mydatabase.sqlite",
    driver: sqlite3.Database,
  });

  // 2. Create table if not exists
  await db.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL
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
      emails: async () => {
        const rows = await db.all(`SELECT email FROM emails`);
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
    },

    Mutation: {
      sendEmail: async (_, { email }) => {
        if (!email.trim()) {
          throw new Error("Email must not be empty");
        }

        try {
          await db.run(`INSERT OR IGNORE INTO emails (email) VALUES (?)`, [
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

          const rows = await db.all(`SELECT email FROM emails`);
          const allEmails = rows.map((row) => row.email);

          return {
            message: "Email Sent!",
            email,
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
    },
  };

  const server = new ApolloServer({
    typeDefs: [typeDefs, typeDefsPosts],
    resolvers,
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

