import { useState } from "react";
import { fetchWithAuth } from "../utils/auth";

const ProfileUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    const data = await fetchWithAuth(
      "/user/uploadProfilePicture",
      "POST",
      formData,
      true
    );
    if (data.success) setImageUrl(data.imageUrl);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="Preview" width={100} />}
      <button onClick={handleUpload}>Upload</button>
      {imageUrl && <img src={imageUrl} alt="Profile" width={100} />}
    </div>
  );
};

export default ProfileUpload;
