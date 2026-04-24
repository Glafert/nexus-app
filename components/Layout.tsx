import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const u = JSON.parse(atob(token.split(".")[1]));
        setUser(u);
      } catch {}
    }

    const mode = localStorage.getItem("theme");
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !dark;
    setDark(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">

      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} user={user} />

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}
        <div className="
          flex justify-between items-center
          px-4 sm:px-6 py-4
          bg-white dark:bg-gray-800 shadow
          shrink-0
        ">

          {/* MENU BUTTON */}
          <button
            className="md:hidden text-2xl text-black dark:text-white"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>

          {/* TITLE */}
          <h1 className="
            font-bold text-sm sm:text-lg
            text-gray-800 dark:text-white
            truncate
          ">
            {user?.role === "ADMIN"
              ? "Admin Dashboard"
              : "User Dashboard"}
          </h1>

          {/* ACTION */}
          <div className="flex gap-2 sm:gap-3 items-center">

            <button
              onClick={toggleTheme}
              className="px-2 sm:px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs sm:text-sm"
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="
          flex-1
          overflow-auto
          p-4 sm:p-6
          dark:text-white

          min-w-0   /* 🔥 INI PALING PENTING */
        ">
          {children}
        </div>
      </div>
    </div>
  );
}