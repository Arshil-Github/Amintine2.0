import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
} from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const hasNull = (obj) =>
  Object.values(obj).some((value) => {
    return value == null || value == "";
  });

const interests = [
  {
    category: "Arts & Creativity",
    items: [
      "Drawing & Painting",
      "Photography & Filmmaking",
      "Writing & Poetry",
      "Acting & Theater",
      "Crafting & DIY",
    ],
  },
  {
    category: "Gaming & Tech",
    items: [
      "Video Games (PC, Console, Mobile)",
      "Board Games & DnD",
      "Coding & Programming",
      "Tech & Gadgets",
    ],
  },
  {
    category: "Music & Entertainment",
    items: [
      "Playing Instruments",
      "Singing & Music Production",
      "Listening to Music",
      "Movies, TV Shows & Anime",
    ],
  },
  {
    category: "Books & Learning",
    items: [
      "Fiction & Non-Fiction Reading",
      "Manga & Comics",
      "Science & Philosophy",
      "Self-Improvement",
    ],
  },
  {
    category: "Fitness & Outdoors",
    items: [
      "Gym & Sports",
      "Yoga & Meditation",
      "Hiking & Adventure",
      "Dancing",
    ],
  },
  {
    category: "Food & Travel",
    items: [
      "Cooking & Baking",
      "Foodie & Café Hopper",
      "Travel & Road Trips",
      "Nature Lover",
    ],
  },
];

const SignupForm = () => {
  const navigate = useNavigate();
  // Form data state
  const [formData, setFormData] = React.useState({
    fullName: "",
    username: "",
    gender: "",
    age: "",
    stype: "",
    bio: "",
    interests: [],
  });

  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [location, setLocation] = useState(null);
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const isSelected = prev.interests.includes(interest);

      if (isSelected) {
        // Deselect the interest
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      } else if (prev.interests.length < 3) {
        // Select only if less than 3 interests are selected
        return {
          ...prev,
          interests: [...prev.interests, interest],
        };
      } else {
        // Do nothing if limit is reached
        return prev;
      }
    });
  };

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;

      const fetchURL =
        "https://amintine2.mohdarshilmbd1.workers.dev/user/register";

      const requestBody = {
        firstName: formData.fullName.split(" ")[0],
        lastName: formData.fullName.split(" ")[1] || "",
        maskedName: formData.username,
        gender: formData.gender,
        age: formData.age,
        stype: formData.stype,
        bio: formData.bio,
        interests: formData.interests,
        googleToken: token,
      };

      if (!location) {
        alert("Error getting location. Please allow location access.");
        return;
      }
      try {
        const response = await fetch(fetchURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...requestBody, position: location }),
        });

        // if (!response.ok) {
        //   throw new Error("Signup failed");
        // }

        const data = await response.json();

        if (data.error) {
          alert(data.error);
          return;
        }

        // Handle successful signup

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Redirect to home
        navigate("/home");
      } catch (error) {
        console.error("Signup error:", error);
        alert("Signup failed! Check console for error.");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: async () => {
      console.log("Login Failed");
      setIsSubmitting(false);
    },
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;

      const fetchURL =
        "https://amintine2.mohdarshilmbd1.workers.dev/user/login";

      const requestBody = {
        googleToken: token,
      };

      if (!location) {
        alert("Error getting location. Please allow location access.");
        return;
      }

      try {
        const response = await fetch(fetchURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...requestBody, position: location }),
        });
        const data = await response.json();

        if (data.error) {
          alert(data.error);
          return;
        }
        // Handle successful signup

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        //Cookies.set("user", data.id);

        // Redirect to home
        navigate("/home");
      } catch (error) {
        console.error("Signup error:", error);
        alert("Signup failed! Check console for error.");
      }
    },
    onError: async () => {
      console.log("Login Failed");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    if (hasNull(formData)) {
      alert("Please fill all the fields");
      return;
    }

    //Get location of the user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          googleSignup();
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Error getting location. Please allow location access.");
        }
      );
    } else {
      alert("Error getting location. Please allow location access.");
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    //Get location of the user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          googleLogin();
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Error getting location. Please allow location access.");
        }
      );
    } else {
      alert("Error getting location. Please allow location access.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 min-h-[90svh] z-10 bg-opacity-40 border-2 border-secondary flex-col flex">
        <div className="mb-2">
          <h1 className="text-4xl font-head font-semibold text-center text-pink-600">
            create account
          </h1>
        </div>

        <div className="min-h-[100%] flex-grow flex flex-col font-body">
          <div className="space-y-2 flex-grow mt-2">
            {/* Full Name */}
            <div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                required
              />
            </div>

            {/* Username & Age */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Username"
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="Age"
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition bg-white"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="f">Female</option>
                <option value="m">Male</option>
                <option value="nb">Non-binary</option>
              </select>
            </div>
            {/* Student Type */}
            <div>
              <select
                name="stype"
                value={formData.stype}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition bg-white"
              >
                <option value="" disabled>
                  Select Student Type
                </option>
                <option value="h">Hosteler</option>
                <option value="d">Day Scholar</option>
              </select>
            </div>

            {/* Bio Input */}
            <div>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Bio"
                className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                required
              />
            </div>

            {/* Interests Section */}
            <div>
              <p className="text-sm text-slate-800 mb-2 font-semibold ">
                Select upto 3 interests
              </p>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-3">
                {interests.map(({ category, items }) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((interest) => (
                        <button
                          key={interest}
                          disabled={
                            formData.interests.length === 3 &&
                            !formData.interests.includes(interest)
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                    ${
                                      formData.interests.includes(interest)
                                        ? "bg-pink-100 text-pink-800 border border-pink-200"
                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                          onClick={() => toggleInterest(interest)}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-pink-600 text-white py-3 rounded hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Creating Account..."
                : "Proceed (using Google account)"}
            </button>

            <button
              className="font-body mt-2 text-center text-sm text-blue-600 hover:text-blue-800 underline w-full"
              onClick={handleLogin}
            >
              Already have an account
            </button>
          </div>
          {/* <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log("Token:", credentialResponse.credential);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </GoogleOAuthProvider> */}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
