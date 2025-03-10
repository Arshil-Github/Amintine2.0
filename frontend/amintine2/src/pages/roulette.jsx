import React, { use, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { fetchWithAuth } from "../utils/auth";
import Loading from "../components/Loading";
import UserModal from "../components/UserModal";

const MatchRoulette = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [match, setMatch] = useState(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSpinLeft();
  }, []);

  const handleSpinLeft = async () => {
    setLoading(true);
    const fetchURL = "/randomMatch/spins";

    try {
      const data = await fetchWithAuth(fetchURL);

      if (data.spins) {
        setSpinsLeft(data.spins);
      } else {
        setSpinsLeft(0);
        console.log("Failed to get spins left");
      }
    } catch (error) {
      console.error("Error getting spins left:", error);
    } finally {
      setLoading(false);
    }
  };

  const findMatch = async () => {
    //Check if Already Sppining
    if (isSpinning) return;

    //Check if Spins Left
    if (spinsLeft <= 0) {
      alert("You have no spins left!");
      return;
    }

    setIsSpinning(true);
    setMatch(null);

    // Rotate 5 full spins + random amount
    const newRotation = rotationDegrees + 360 * 5 + Math.random() * 360;
    setRotationDegrees(newRotation);

    try {
      // Simulate API call - replace with your actual API endpoint
      setTimeout(async () => {
        setLoading(true);
        const fetchURL = "/randomMatch/match";

        const data = await fetchWithAuth(fetchURL);

        if (data.error) {
          alert(data.error);
          setIsSpinning(false);
          setLoading(false);
          return;
        }

        const randomMatch = {
          id: data.id,
          name: data.firstName + " " + data.lastName,
          age: data.age,
          sType: data.sType == "h" ? "Hosteler" : "Day Scholar",
          interests: data.interests,
          bio: data.bio,
        };

        // const mockMatch = {
        //   name: "Sarah Parker",
        //   age: 25,
        //   location: "New York",
        //   interests: ["Photography", "Travel", "Art"],
        //   bio: "Love exploring new places and capturing moments through my lens.",
        //   distance: "2.5 miles away",
        // };

        setMatch(randomMatch);
        setSpinsLeft(spinsLeft - 1);
        setIsSpinning(false);
        setLoading(false);
      }, 3000); // Spin for 3 seconds
    } catch (error) {
      console.error("Error finding match:", error);
      alert("Error Finding Match");
      setIsSpinning(false);
      setLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!match) {
      console.error("No match to send message to");
      return;
    }
    if (!message) {
      return;
    }

    setLoading(true);

    const fetchBody = {
      paricipantId: match.id,
    };
    // Send message to match
    const data = await fetchWithAuth("/chat/create", "POST", fetchBody);

    const chatData = await fetchWithAuth("/chat/send", "POST", {
      chatId: data.chat.id,
      content: message,
    });

    setMatch(null);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      <Loading isLoading={loading} />
      <div className="absolute inset-0 bg-[url('/images/sakura2jpg.jpg')] bg-cover bg-center bg-no-repeat " />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/70" />

      <div className="flex justify-between items-center my-5 z-10 w-full ">
        <div className="text-5xl font-thin text-primary z-10 font-head ">
          match roulette
        </div>
      </div>
      <div className="relative min-h-full bg-space p-4 rounded-md overflow-hidden bg-opacity-10">
        <div className="max-w-md mx-auto pt-10">
          {/* Roulette Circle */}
          <div className="relative aspect-square mb-8">
            {/* Outer circle */}
            <div className="absolute inset-0 rounded-full border-8 border-primary bg-white shadow-lg flex items-center justify-center bg-opacity-10">
              {/* Inner spinning circle */}
              <div
                className="w-4/5 h-4/5 rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-[3000ms] ease-out flex items-center justify-center"
                style={{
                  transform: `rotate(${rotationDegrees}deg)`,
                }}
              >
                <button
                  onClick={findMatch}
                  disabled={isSpinning}
                  className="w-3/4 h-3/4 rounded-full bg-white shadow-inner flex items-center justify-center text-xl font-semibold text-pink-600 hover:scale-105 transition-transform cursor-pointer disabled:cursor-not-allowed font-body"
                  style={{ transform: `rotate(-${rotationDegrees}deg)` }} // Counter-rotate the text
                >
                  Spin the Wheel
                </button>
              </div>
            </div>
          </div>

          {/* Match Profile Card */}
          {match && (
            <UserModal
              match={match}
              setMatch={setMatch}
              sendCall={handleSendMessage}
            />
          )}
        </div>
      </div>
      <div className="relative min-h-full  p-4 rounded-md overflow-hidden font-body text-white">
        <div className="text-center">Spins Left: {spinsLeft}/3</div>
        <div className="text-center">One spin is added every hour</div>
      </div>
    </div>
  );
};

export default MatchRoulette;
