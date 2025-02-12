import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Dices, Clipboard, MessageSquare, HomeIcon } from "lucide-react";
import Welcome from "./welcome";
import MatchRoulette from "./roulette";
import ConfessionsPage from "./confessions";
import ConversationList from "./conversationList";
import { fetchWithAuth } from "../utils/auth";
import { Smiley, Heart, Bell } from "phosphor-react";

const HomeScreen = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      component: <Home />,
      path: "/home",
    },
    {
      component: <MatchRoulette />,
      path: "/home/randomMatch",
    },
    {
      component: <ConfessionsPage />,
      path: "/home/confession",
    },
    {
      component: <ConversationList />,
      path: "/home/chat",
    },
  ];
  return (
    <div className="max-w-full mx-auto bg-white h-screen flex flex-col max-h-[100svh]">
      {/* Main Content Area - Left empty for custom content */}
      <div className="relative flex-1   flex-grow overflow-hidden">
        <Routes>
          <Route path="/" element={<Home navigate={navigate} />} />
          <Route path="/randomMatch" element={<MatchRoulette />} />
          <Route path="/confession" element={<ConfessionsPage />} />
          <Route path="/chat" element={<ConversationList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <BottomNav navItems={navItems} currentPath={currentPath} />
    </div>
  );
};

const BottomNav = ({ navItems, currentPath }) => {
  console.log(currentPath);
  const navigate = useNavigate();
  return (
    <div className="absolute  bottom-0  right-0 left-0 max-w-md mx-auto px-10 py-3 z-50">
      <div className="flex justify-between items-center gap-4 w-full bg-pink-50 px-8 rounded-full border-pink-200 border-2 z-20">
        {navItems.map(({ path, component }) => {
          return (
            <NavButton
              key={path}
              path={path}
              onClick={() => navigate(path)}
              currentPath={currentPath}
            >
              {component.type.name === "Home" ? (
                <Smiley size={24} color="#4F46E5" weight="bold" />
              ) : component.type.name === "MatchRoulette" ? (
                <Dices size={24} />
              ) : component.type.name === "ConfessionsPage" ? (
                <Clipboard size={24} />
              ) : component.type.name === "ConversationList" ? (
                <MessageSquare size={24} />
              ) : (
                "A"
              )}
            </NavButton>
          );
        })}
      </div>
    </div>
  );
};

const NavButton = ({ children, onClick, path, currentPath }) => {
  const navBgColor = currentPath == path ? "primary" : "gray-400";

  return (
    <button className={`p-2 text-${navBgColor}`} onClick={onClick}>
      {children}
    </button>
  );
};

const Home = ({ navigate }) => {
  return (
    <div>
      <div className="absolute inset-0 bg-[url('/images/sakura.jpg')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/50" />

      <div className="relative z-10 p-6 flex flex-col h-full gap-1">
        <div className="text-2xl font-body font-semibold text-slate-300">
          Welcome to,
        </div>
        <div className="text-6xl font-head text-primary text-center font-extralight">
          amintine
        </div>

        <div className="mt-6 mb-4 font-body text text-slate-300 text-right">
          <div> Kindly share it to your peers </div>
          <div> and let's get started </div>
        </div>

        <div className="gap-4">
          <HomeButton onClick={() => navigate("/home/confession")}>
            Confession Board
          </HomeButton>
          <HomeButton onClick={() => navigate("/home/randomMatch")}>
            Crush Roullete
          </HomeButton>
          <HomeButton onClick={() => navigate("/home/chat")}>Chats</HomeButton>
        </div>
      </div>
    </div>
  );
};

const HomeButton = ({ icon, onClick, children }) => {
  return (
    <div className="flex justify-end mb-2 font-head">
      <button
        className="bg-pink-200 bg-opacity-55 rounded-md shadow-md text-space w-56 py-2 px-3 font-body font-semibold text-lg tracking-wide justify-center items-center"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export default HomeScreen;
