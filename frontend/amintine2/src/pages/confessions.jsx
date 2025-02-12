import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { fetchWithAuth } from "../utils/auth";
import Loading from "../components/Loading";

const ConfessionsPage = () => {
  const [confessions, setConfessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newConfession, setNewConfession] = useState({
    to: "",
    content: "",
    isAnonymous: false,
  });

  // Fetch confessions from server
  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    try {
      const data = await fetchWithAuth("/confession/all");

      const confessionData = data.map((entry) => {
        const likesList = entry.likes;
        const likes = likesList.length;

        return {
          id: entry.id,
          to: entry.targetName,
          content: entry.content,
          author: entry.isAnonymous
            ? "Anonymous"
            : entry.author
            ? entry.author
            : "Anonymous",
          isAnonymous: entry.isAnonymous,
          timestamp: entry.createdAt || "2024-02-09T10:30:00Z",
          likes: likes,
          isLiked: entry.likedByUser,
        };
      });

      //   const mockData = [
      //     {
      //       id: 1,
      //       to: "Sarah from CS class",
      //       content:
      //         "I've always admired how you help everyone understand difficult concepts.",
      //       author: "John Doe",
      //       isAnonymous: false,
      //       timestamp: "2024-02-09T10:30:00Z",
      //     },
      //     {
      //       id: 2,
      //       to: "The guy who always wears red",
      //       content:
      //         "Your style brightens up my day every time I see you in the hallway.",
      //       author: "Anonymous",
      //       isAnonymous: true,
      //       timestamp: "2024-02-09T09:15:00Z",
      //     },
      //   ];

      setConfessions(confessionData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching confessions:", error);
      setLoading(false);
    }
  };

  const handleLike = async (confessionId) => {
    try {
      // Local Update
      setConfessions((prevConfessions) =>
        prevConfessions.map((confession) => {
          if (confession.id === confessionId) {
            const newIsLiked = !confession.isLiked;
            return {
              ...confession,
              isLiked: newIsLiked,
              likes: confession.likes + (newIsLiked ? 1 : -1),
            };
          }
          return confession;
        })
      );

      const data = await fetchWithAuth("/confession/like", "POST", {
        confessionId,
      });

      if (data.error) {
        console.error("Failed to update like");
        return;
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fetchBody = {
      content: newConfession.content,
      isAnonymous: newConfession.isAnonymous,
      targetName: newConfession.to,
    };

    try {
      const data = await fetchWithAuth("/confession/create", "POST", fetchBody);

      console.log("Confession created:", data);

      // Add to local state (replace with actual API response)
      const localEntry = {
        id: confessions.length + 1,
        ...newConfession,
        author: newConfession.isAnonymous ? "Anonymous" : "Current User",
        timestamp: new Date().toISOString(),
      };

      setConfessions((prev) => [localEntry, ...prev]);
      setIsModalOpen(false);
      setNewConfession({ to: "", content: "", isAnonymous: false });
    } catch (error) {
      console.error("Error creating confession:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      <Loading isLoading={loading} />
      <div className="absolute inset-0 bg-[url('/images/building.jpg')] bg-cover bg-center bg-no-repeat " />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/70" />
      <div className="relative z-10 max-w-2xl mx-auto px-3">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex justify-between items-center my-5 z-10 w-full ">
            <div className="text-5xl font-thin text-primary z-10 font-head ">
              confession board
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6  border-b border-pink-300 py-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-pink-600 text-white hover:bg-pink-700 transition-colors w-full"
          >
            New Confession
          </button>
        </div>

        {/* Confessions List */}
        {loading ? (
          <div className="text-center py-10 font-body text-space">
            Loading...
          </div>
        ) : (
          <div className="space-y-4 font-body max-h-[65svh] overflow-y-auto">
            {confessions.map((confession) => (
              <div
                key={confession.id}
                className="bg-white rounded-lg shadow-sm p-6 space-y-3 bg-opacity-90"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">
                    To: {confession.to}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(confession.timestamp)}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {confession.content}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(confession.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                        confession.isLiked
                          ? "bg-pink-100 text-pink-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-lg">
                        {confession.isLiked ? "♥" : "♡"}
                      </span>
                      <span className="text-sm font-medium">
                        {confession.likes}
                      </span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    - {confession.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Confession Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  New Confession
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="text"
                    value={newConfession.to}
                    onChange={(e) =>
                      setNewConfession((prev) => ({
                        ...prev,
                        to: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition"
                    placeholder="Who is this confession for?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Confession
                  </label>
                  <textarea
                    value={newConfession.content}
                    onChange={(e) =>
                      setNewConfession((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition h-32 resize-none"
                    placeholder="Write your confession here..."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newConfession.isAnonymous}
                    onChange={(e) =>
                      setNewConfession((prev) => ({
                        ...prev,
                        isAnonymous: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label
                    htmlFor="anonymous"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Post as anonymous
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Post Confession
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfessionsPage;
