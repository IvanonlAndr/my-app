import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { useQuery, gql } from "@apollo/client";

const GET_ALL_POSTS = gql`
  query GetAllPosts {
    getAllPosts {
      id
      title
      description
      message
    }
  }
`;

function Publications() {
  const { loading, error, data } = useQuery(GET_ALL_POSTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading posts</p>;

  console.log("Posts data:", data.getAllPosts);

  return (
    <>
      <Button>
        <Link to="/create-publication">Publish</Link>
      </Button>

      <h1>All Posts</h1>
      {data.getAllPosts.map((post) => (
        <div
          key={post.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "1rem",
            padding: "1rem",
          }}
        >
          <h2>{post.title}</h2>
          <h4>{post.description}</h4>
          <p>{post.message}</p>
        </div>
      ))}
    </>
  );
}

export default Publications;
