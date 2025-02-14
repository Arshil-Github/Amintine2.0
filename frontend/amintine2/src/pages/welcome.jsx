import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  const getStartedEventHandler = () => {
    navigate("/signup");
  };
  const [confession, setconfession] = useState(null);

  useEffect(() => {
    getLatestConfession();
  }, []);

  const getLatestConfession = async () => {
    const response = await fetch(
      "https://amintine2.mohdarshilmbd1.workers.dev/confession/latest"
    );
    const data = await response.json();
    setconfession(data);
  };

  return (
    <div className="w-full max-w-full mx-auto relative shadow-lg h-[100svh] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/welcomebg.jpg')] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/50" />
      <div className="relative z-10 p-6 flex flex-col h-full">
        <div>
          <div className="text-7xl font-medium text-primary font-head pt-10 text-center tracking-tighter">
            amintine
          </div>
          <div className="text-2xl font-medium text-white font-head text-center trac">
            making amity friends
          </div>
        </div>
        <div className="text-white text-center text-md mt-5 font-body flex-grow">
          Get ready to immerse yourself in the captivating realm of college
          connection, where thrilling encounters awaits your leap <br />
          Made for Amitians by an amitian
          {confession && (
            <div className="mt-10">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-3 bg-opacity-60 text-start">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">
                    To: {confession.targetName}
                  </h3>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {confession.content}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    - {confession.author}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">Sign in to read more...</div>
            </div>
          )}
        </div>
        <div>
          <button
            className="bg-gradient-to-l to-primary from-secondary rounded-3xl text-space w-full py-3 font-body font-semibold text-lg tracking-wide"
            onClick={getStartedEventHandler}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
