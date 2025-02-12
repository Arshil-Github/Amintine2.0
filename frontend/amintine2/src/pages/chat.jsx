import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "../utils/auth";

let mockChatData = [
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "me",
    message: "Hey, how are you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
  {
    sender: "them",
    message: "All good what about you?",
    timestamp: "2024-02-09T10:30:00Z",
  },
];
const Chat = () => {
  const navigate = useNavigate();
  const [currentText, setCurrentText] = useState("");
  const { id } = useParams();
  const [chat, setChat] = useState([]);
  const [otherUser, setOtherUser] = useState("");

  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setupChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleExitClick = () => {
    navigate("/home/chat");
  };

  const handleTextSend = async () => {
    console.log("Sending message:", currentText);

    //Send this data over to the server
    try {
      const data = await fetchWithAuth("/chat/send", "POST", {
        chatId: id,
        content: currentText,
      });
      setChat([
        ...chat,
        {
          sender: "me",
          message: currentText,
          timestamp: new Date().toISOString(),
        },
      ]);
      setCurrentText("");
    } catch (e) {
      console.log(e);
      alert("Error in sending message");
    }
  };

  const handleTextChange = (e) => {
    setCurrentText(e.target.value);
  };

  const setupChat = async () => {
    try {
      const data = await fetchWithAuth(`/chat/messages/${id}`);
      const formattedData = data.messages.map((message) => {
        return {
          sender: message.sender,
          message: message.message,
          timestamp: message.timestamp,
        };
      });
      setOtherUser(data.otherUserName);
      setChat(formattedData);
      // setChat(mockChatData);
    } catch (e) {
      cosnole.log(e);
      alert("Error in fetching chat data");
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="flex flex-col h-[100svh] max-h-[100svh] bg-gradient-to-b from-pink-100 to-pink-50 py-3">
      {/* Header */}
      <div className=" p-2 flex  items-center border-b-2 border-pink-50">
        <button className="text-xl mr-3" onClick={handleExitClick}>
          &times;
        </button>
        <h1 className="text-xl font-semibold font-head">
          {otherUser || "Name Loading...."}
        </h1>
      </div>

      {/* Messages */}
      <div
        className="flex-grow p-3 mt-3 font-body overflow-y-auto "
        ref={scrollContainerRef}
      >
        {chat.map((chat) => {
          if (chat.sender === "them") {
            return (
              <SentMessage
                key={chat.id}
                message={chat.message}
                time={formatTime(chat.timestamp)}
              />
            );
          } else {
            return (
              <ReceivedMessage
                key={chat.id}
                message={chat.message}
                time={formatTime(chat.timestamp)}
              />
            );
          }
        })}
        <div ref={bottomRef} className="text-sm text-gray-500 text-center">
          Chats are not realtime. <br />
          Please refresh to see new messages
        </div>
      </div>

      {/* Message Input */}
      <div className="py-1 px-3">
        <div className="bg-pink-100 rounded-3xl flex px-5 border-2 border-pink-300">
          <input
            type="text"
            placeholder="Type a message"
            className="w-full py-2 bg-transparent outline-none"
            value={currentText}
            onChange={handleTextChange}
            onSubmit={handleTextSend}
          />
          <button
            className="text-pink-400 font-medium"
            onClick={handleTextSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const SentMessage = ({ message, time }) => {
  return (
    <div className="flex w-fit">
      <div className="mr-auto bg-pink-200 py-2 px-4 rounded-2xl my-2 w-fit">
        {message}
      </div>
      <div className=" py-3 px-1 text-sm justify-end flex flex-col text-gray-500">
        {time}
      </div>
    </div>
  );
};
const ReceivedMessage = ({ message, time }) => {
  return (
    <div className="flex w-fit ml-auto">
      <div className=" py-3 px-1 text-sm justify-end flex flex-col text-gray-500">
        {time}
      </div>
      <div className="ml-auto bg-pink-400 py-2 px-4 rounded-2xl my-2 w-fit text-white">
        {message}
      </div>
    </div>
  );
};

export default Chat;
