import Layout from "../components/Layout";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [preview, setPreview] = useState("");
  const [compressed, setCompressed] = useState("");
  const [showPreview, setShowPreview] = useState(false); // 🔥 modal

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");

    if (!u) {
      window.location.href = "/";
      return;
    }

    setUser(u);
  }, []);

  const compressImage = (file: File) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 300;
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = await compressImage(file);
    setPreview(img);
    setCompressed(img);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session habis, login ulang");
        window.location.href = "/";
        return;
      }

      await axios.post(
        "/api/profile/upload",
        {
          userId: user.id,
          image: compressed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = { ...user, avatar: compressed };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);

      alert("Saved!");
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err);

      if (err.response?.status === 401) {
        alert("Session expired, login ulang");
        localStorage.clear();
        window.location.href = "/";
      } else {
        alert("Upload gagal");
      }
    }
  };

  if (!user) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        My Profile
      </h1>

      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded shadow max-w-md">
        
        {/* 🔥 AVATAR */}
        <img
          src={preview || user.avatar || "/avatar.png"}
          className="w-24 h-24 rounded-full mb-4 object-cover cursor-pointer hover:opacity-80"
          onClick={() => setShowPreview(true)}
        />

        {/* 🔥 INPUT FIX DARK MODE */}
        <input
          type="file"
          onChange={handleFile}
          className="mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-2 rounded"
        />

        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>

        {/* 🔥 TEXT FIX */}
        <p className="mt-4">ID: {user.id}</p>
        <p>Username: {user.username}</p>
        <p>Role: {user.role}</p>
      </div>

      {/* 🔥 MODAL */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={preview || user.avatar || "/avatar.png"}
            className="max-w-full max-h-full rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setShowPreview(false)}
          >
            ×
          </button>
        </div>
      )}
    </Layout>
  );
}