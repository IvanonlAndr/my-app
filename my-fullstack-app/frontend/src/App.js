import logo from "./logo.svg";
import "./App.tsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home.js";
import Publications from "./components/Publications.js";
import CreatePublication from "./components/CreatePublication.js";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/create-publication" element={<CreatePublication />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
