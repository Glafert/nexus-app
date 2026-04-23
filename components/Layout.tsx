import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(token){
      try {
        const u = JSON.parse(atob(token.split(".")[1]));
        setUser(u);
      } catch {}
    }

    const mode = localStorage.getItem("theme");
    if(mode==="dark"){
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  },[]);

  const toggleTheme = () => {
    const newMode = !dark;
    setDark(newMode);

    if(newMode){
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme","dark");
    }else{
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme","light");
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">

      <Sidebar open={open} setOpen={setOpen} user={user} />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow">

          <button 
            className="md:hidden text-2xl text-black dark:text-white"
            onClick={()=>setOpen(!open)}
          >
            ☰
          </button>

          <h1 className="font-bold text-lg text-gray-800 dark:text-white">
            {user?.role === "ADMIN" ? "Admin Dashboard" : "User Dashboard"}
          </h1>

          <div className="flex gap-3 items-center">
            <button 
              onClick={toggleTheme}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm"
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <button 
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto dark:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}