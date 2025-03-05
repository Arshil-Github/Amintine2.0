import React, { use, useEffect, useState } from "react";

export default UserModal = ({ match, setMatch, sendCall = (s) => {} }) => {
  const [message, setMessage] = useState("");
  const handleSendMessage = async () => {
    sendCall(message);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md w-full relative animate-fade-up">
        {/* Close button */}
        <button
          onClick={() => setMatch(null)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="text-gray-600">&times;</span>
        </button>

        <div className="space-y-2 pt-2">
          <h2 className="text-2xl font-semibold text-gray-800 font-head">
            {match.name}, {match.age}
          </h2>
          <p className="text-sm text-gray-500 font-body">{match.sType}</p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 font-body">{match.bio}</p>
          <div className="flex flex-wrap gap-2">
            {match.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-body"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <div className="font-head text-secondary text-lg items-center text-center">
            Drop them a message!
          </div>
          <div className="bg-pink-50 rounded-3xl flex px-5 border-2 border-pink-300">
            <input
              type="text"
              placeholder="Type a message"
              className="w-full py-2 bg-transparent outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="text-pink-400 font-medium"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
