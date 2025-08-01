import logo from "./logo.svg";
import "./App.tsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home.js";
import Publications from "./components/Publications.js";
import CreatePublication from "./components/CreatePublication.js";
import Login from "./components/Login.js";
import Navbar from "./components/Navbar.js";
import MainLayout from "./layout/MainLayout.js";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/create-publication" element={<CreatePublication />} />
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

