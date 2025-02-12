import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import SignupForm from "./pages/signup";
import MatchRoulette from "./pages/roulette";
import ConfessionsPage from "./pages/confessions";
import ConversationList from "./pages/conversationList";
import Chat from "./pages/chat";
import Welcome from "./pages/welcome";
import React, { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import HomeScreen from "./pages/HomeScreen";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  const accessToken = localStorage.getItem("accessToken");
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Router basename="/">
      <div
        className={
          !isMobile
            ? "min-h-screen bg-gradient-to-b from-pink-100 to-white p-4 flex items-center justify-center"
            : ""
        }
      >
        <div
          className={
            !isMobile
              ? "w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg"
              : ""
          }
        >
          <GoogleOAuthProvider
            clientId={
              "437314577088-jv3ub7c7l9e3lgfbco5ei5qvhkmgkrlo.apps.googleusercontent.com"
            }
          >
            <Routes>
              <Route
                path="/"
                element={
                  accessToken ? (
                    <Navigate to="/home" replace />
                  ) : (
                    <Navigate to="/welcome" replace />
                  )
                }
              />
              <Route path="/welcome" element={<Welcome />} />
              <Route
                path="/home/*"
                element={
                  <ProtectedRoute>
                    <HomeScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/chat/:id" element={<Chat />} />
            </Routes>
          </GoogleOAuthProvider>
        </div>
      </div>
    </Router>
  );
}

export default App;
