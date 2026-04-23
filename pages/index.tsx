import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 🔥 tambahan
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", { username, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      router.push("/dashboard");
    } catch {
      alert("Login gagal");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-8 shadow rounded w-80">
        <h2 className="text-xl mb-4 font-bold">Login</h2>

        <input
          className="w-full border p-2 mb-3"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        {/* 🔥 PASSWORD + ICON */}
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border p-2 pr-10"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 cursor-pointer text-gray-500"
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}