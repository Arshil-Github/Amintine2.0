const GOOGLE_CLIENT_ID =
  "437314577088-jv3ub7c7l9e3lgfbco5ei5qvhkmgkrlo.apps.googleusercontent.com";

export async function verifyGoogleToken(idToken: any) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${idToken}`
  );
  if (!response.ok) throw new Error("Invalid Google Token");
  const data: any = await response.json();

  if (data.audience !== GOOGLE_CLIENT_ID)
    throw new Error("Token audience mismatch");
  return data; // contains user info (email, name, etc.)
}
