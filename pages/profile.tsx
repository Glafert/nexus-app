import Layout from "../components/Layout";
import axios from "axios";
import { useState } from "react";

export default function Profile() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(atob(token.split(".")[1]));

  const [preview, setPreview] = useState("");
  const [compressed, setCompressed] = useState("");

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 300;
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressedImg = await compressImage(file);

    setPreview(compressedImg);
    setCompressed(compressedImg);
  };

  const handleSave = async () => {
    if (!compressed) return alert("Pilih gambar dulu");

    if (!confirm("Simpan foto profile?")) return;

    await axios.post("/api/profile/upload", {
      userId: user.id,
      image: compressed,
    });

    alert("Foto berhasil disimpan!");
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md">
        <img 
          src={preview || "/avatar.png"} 
          className="w-24 h-24 rounded-full mb-4 object-cover"
        />

        <input type="file" onChange={handleFile} className="mb-3"/>

        <button 
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Save
        </button>

        <p>ID: {user.id}</p>
        <p>Username: {user.username}</p>
        <p>Role: {user.role}</p>
      </div>
    </Layout>
  );
}