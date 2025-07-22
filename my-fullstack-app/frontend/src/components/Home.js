
import { Link } from "react-router-dom";
import EmailSend from "./EmailSend.js";
function Home() {
  return (
    <>
      <Link to="/">home</Link>
      <Link to="/publications">publications</Link>

      <EmailSend />
    </>
  );
}

export default Home;
