const API_URL = "http://127.0.0.1:8787";
// const API_URL = "https://amintine2.mohdarshilmbd1.workers.dev";

export const loginWithGoogle = async (idToken) => {
  const res = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
};

export const fetchWithAuth = async (url, method = "GET", body = null) => {
  let accessToken = localStorage.getItem("accessToken");

  let options = {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let res = await fetch(`${API_URL}${url}`, options);

  if (res.status === 401) {
    // Token Expired → Refresh
    const refreshToken = localStorage.getItem("refreshToken");

    const refreshRes = await fetch(`${API_URL}/user/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const refreshData = await refreshRes.json();
    if (refreshData.accessToken) {
      localStorage.setItem("accessToken", refreshData.accessToken);

      // Retry Original Request
      options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
      res = await fetch(`${API_URL}${url}`, options);
    }
  }

  return res.json();
};
