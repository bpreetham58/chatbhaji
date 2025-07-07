import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, setOnlineUsers } from "./store/slices/authSlice";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "./lib/socket";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login"; // ✅ added
import { ToastContainer } from "react-toastify";

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth); // ✅ fixed
  const dispatch = useDispatch(); // ✅ fixed

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]); // ✅ fixed

  useEffect(() => {
    if (authUser) {
      const socket = connectSocket(authUser._id);

      socket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      return () => disconnectSocket();
    }
  }, [authUser, dispatch]); // added dispatch here too

  if (isCheckingAuth && !authUser) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/register"
            element={!authUser ? <Register /> : <Navigate to={"/"} />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to={"/"} />}
          />
          <Route
            path="/profile"
            element={authUser ? <Profile /> : <Navigate to={"/login"} />}
          />
        </Routes>
      </Router>

      <ToastContainer /> {/* ✅ added */}
    </>
  );
};

export default App;
