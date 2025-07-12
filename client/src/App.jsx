import React from "react";
import { Routes, Route,Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ChatPage from "./ChatPage";
import Home from "./pages/Home";
import CreateGroup from "./pages/CreateGroup";


const App = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  return (
    <Routes>
      <Route path="/" element={<Home />} /> // 👈 Neo-styled homepage
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route
        path="/create-group"
        element={
          user ? (
            <CreateGroup currentUserId={user.id} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

export default App;
