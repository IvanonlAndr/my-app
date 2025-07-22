const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("nodemailer");
const { ApolloServer, gql } = require("apollo-server-express");
const { v4: uuidv4 } = require("uuid");


app.use(cors());

let data = {
  emails: [],
};

let dataOfPost = {
  post: [],
};

const typeDefs = gql`
  type Query {
    emails: [String!]!
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

const resolvers = {
  Query: {
    emails: async () => {
      // Try to read emails.json file to get persisted emails on server start
      try {
        const fileData = await fs.readFile(
          path.join(__dirname, "emails.json"),
          "utf8"
        );
        const parsed = JSON.parse(fileData);
        data.emails = parsed.emails || [];
      } catch {
        // ignore if file does not exist yet
      }
      return data.emails;
    },

    getPost: async (id) => {
      try {
        const fileData = await fs.readFile(
          path.join(__dirname, "posts.json"),
          "utf8"
        );
        const parsed = JSON.parse(fileData);
        const posts = parsed.posts || [];

        const post = posts.find((p) => p.id === id);

        if (!post) {
          throw new Error("Post not found");
        }

        return post;
      } catch (err) {
        console.error("Error reading posts:", err);
        throw new Error("Failed to get post");
      }
    },

    getAllPosts: async () => {
      try {
        const fileData = await fs.readFile(
          path.join(__dirname, "posts.json"),
          "utf8"
        );
        const parsed = JSON.parse(fileData);
        const posts = parsed.dataOfPost?.post || [];

        return posts;
      } catch (err) {
        console.error("Error reading posts:", err);
        throw new Error("Failed to get post");
      }
    },
  },

  Mutation: {
    sendEmail: async (_, { email }) => {
      if (!email.trim()) {
        throw new Error("Email must not be empty");
      }
      if (!data.emails.includes(email)) {
        data.emails.push(email);
      }

      try {
        await transporter.sendMail({
          from: '"Ivan Komissarov" <komivan06@gmail.com>',
          to: email,
          subject: "Hello ✔",
          text: "Hello world?", // plain text body
          html: `<b>Hello world?</b><a href="http://bit.ly/44IHQsY"><button>asd</button></a>`,
        });

        await fs.writeFile(
          path.join(__dirname, "emails.json"),
          JSON.stringify(data, null, 2) + "\n"
        );
      } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email send failed");
      }

      return {
        message: "Email Sent!",
        emails: data.emails,
      };
    },

    createPost: async (_, { values }) => {
      const { title, description, message } = values;
      const id = uuidv4();
      const exists = dataOfPost.post.some((post) => post.id === id);

      let newPost;

      if (!exists) {
        newPost = {
          id,
          title,
          description,
          message,
        };

        dataOfPost.post.push(newPost);
      }

      const filePath = path.join(__dirname, "posts.json");
      const fileData = await fs.readFile(filePath, "utf8");
      let parsed = { post: [] };

      try {
        const fileData = await fs.readFile(filePath, "utf8");

        if (fileData.trim()) {
          parsed = JSON.parse(fileData);
        }
      } catch (err) {
        console.error("Error reading or parsing posts.json:", err);
      }
      // const posts = parsed.posts || [];

      try {
        await fs.writeFile(
          filePath,
          JSON.stringify({ dataOfPost }, null, 2) + "\n"
        );
      } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email send failed");
      }

      return newPost;
    },
  },
};

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "komivan06@gmail.com",
    pass: "gnae knsk pizm avzr",
  },
});

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs: [typeDefs, typeDefsPosts], // merge schemas
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
