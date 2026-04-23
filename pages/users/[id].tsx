import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState<any>(null);
  const [preview, setPreview] = useState("");
  const [compressed, setCompressed] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // ======================
  // LOAD USER + CHECK ROLE
  // ======================
  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1]));
      setIsAdmin(decoded.role === "ADMIN");

      if (id) loadUser(token);
    } catch {
      router.push("/");
    }
  }, [id]);

  const loadUser = async (token: string) => {
    const res = await axios.get(`/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUser(res.data);
  };

  // ======================
  // COMPRESS IMAGE
  // ======================
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

  // ======================
  // UPDATE AVATAR (ADMIN)
  // ======================
  const handleSave = async () => {
    try {
      const token = getToken();

      if (!token) {
        alert("Session habis");
        router.push("/");
        return;
      }

      await axios.put(
        `/api/users/${user.id}`, // 🔥 FIX: pakai endpoint users
        {
          avatar: compressed,   // 🔥 kirim avatar ke users API
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 wajib
          },
        }
      );

      alert("Avatar updated!");

      setUser({ ...user, avatar: compressed });
      setPreview("");
      setCompressed("");

    } catch (err: any) {
      console.error("UPDATE ERROR:", err);

      if (err.response?.status === 403) {
        alert("Hanya ADMIN yang bisa update user");
      } else if (err.response?.status === 401) {
        alert("Session expired");
        localStorage.clear();
        router.push("/");
      } else {
        alert("Gagal update avatar");
      }
    }
  };

  if (!user) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">User Detail</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md">

        {/* 🔥 CLICKABLE AVATAR */}
        <img
          src={preview || user.avatar || "/avatar.png"}
          className="w-24 h-24 rounded-full mb-4 object-cover cursor-pointer hover:opacity-80"
          onClick={() => setShowPreview(true)}
        />

        {/* 🔥 ADMIN ONLY */}
        {isAdmin && (
          <>
            <input type="file" onChange={handleFile} className="mb-3" />

            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
              Update Avatar
            </button>
          </>
        )}

        <p>ID: {user.id}</p>
        <p>Username: {user.username}</p>
        <p>Role: {user.role}</p>
      </div>

      {/* 🔥 FULLSCREEN PREVIEW */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={preview || user.avatar || "/avatar.png"}
            className="max-w-full max-h-full rounded-lg"
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