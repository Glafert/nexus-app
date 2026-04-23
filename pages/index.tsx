import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch {
      alert("Login gagal");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-8 shadow rounded w-80">
        <h2 className="text-xl mb-4 font-bold">Login</h2>
        <input className="w-full border p-2 mb-3" placeholder="Username" onChange={(e)=>setUsername(e.target.value)} />
        <input type="password" className="w-full border p-2 mb-3" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
      </div>
    </div>
  );
}