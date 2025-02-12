import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/auth";

const ConversationList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // Replace with your actual API call
      const mockConversations = [
        {
          id: 1,
          name: "Sarah Parker",
          lastMessage: "Yeah, that sounds great!",
          timestamp: "2024-02-09T10:30:00Z",
          unread: 2,
          messages: [
            {
              id: 1,
              text: "Hey, how are you?",
              sender: "them",
              timestamp: "2024-02-09T10:25:00Z",
            },
            {
              id: 2,
              text: "Would you like to grab coffee sometime?",
              sender: "me",
              timestamp: "2024-02-09T10:28:00Z",
            },
            {
              id: 3,
              text: "Yeah, that sounds great!",
              sender: "them",
              timestamp: "2024-02-09T10:30:00Z",
            },
          ],
        },
        {
          id: 2,
          name: "John Smith",
          lastMessage: "See you tomorrow then!",
          timestamp: "2024-02-09T09:15:00Z",
          unread: 0,
          messages: [
            {
              id: 1,
              text: "Are we still on for the study group?",
              sender: "them",
              timestamp: "2024-02-09T09:10:00Z",
            },
            {
              id: 2,
              text: "Yes, library at 2pm",
              sender: "me",
              timestamp: "2024-02-09T09:12:00Z",
            },
            {
              id: 3,
              text: "See you tomorrow then!",
              sender: "them",
              timestamp: "2024-02-09T09:15:00Z",
            },
          ],
        },
      ];

      const data = await fetchWithAuth("/chat/my-chats");

      if (data.error)
        return console.error("Error fetching conversations:", data.error);

      if (data.length === 0) return console.log("No conversations found");

      if (data[0].id == null) return console.log("No messages found");

      const conversations = data.map((conversation) => ({
        id: conversation.id,
        name: conversation.otherUserName,
        lastMessage: conversation.messages[0].content,
        timestamp: conversation.messages[0].createdAt,
        unread: 0,
      }));

      setConversations(conversations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
    }
  };

  const handleChatClick = (conversation) => {
    setSelectedChat(conversation);
    navigate(`/chat/${conversation.id}`);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen flex bg-gray-100 p-4">
      <div className="absolute inset-0 bg-[url('/images/sakuraroad.jpg')] bg-cover bg-center bg-no-repeat " />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/70" />

      {/* Conversations List */}
      <div className="w-full z-10  h-[93%] realtive">
        <div className="flex justify-between items-center my-5 z-10 w-full ">
          <div className="text-5xl font-thin text-primary z-10 font-head ">
            chats
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-space">Loading...</div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-170px)] font-body bg-white bg-opacity-30 rounded-md shadow-lg p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleChatClick(conversation)}
                className={`p-4 mb-2 rounded-sm border-b cursor-pointer bg-pink-100 hover:bg-pink-50 transition-colors  ${
                  selectedChat?.id === conversation.id ? "bg-pink-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-800">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.timestamp)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
