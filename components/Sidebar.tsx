import Link from "next/link";

export default function Sidebar({ open, setOpen, user }) {
  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={()=>setOpen(false)}
        />
      )}

      <div className={`fixed md:relative z-50 bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 h-full p-6 transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition`}>

        <h2 className="text-xl font-bold mb-8">🚀 Nexus Panel</h2>

        <ul className="space-y-5 text-sm">
          <li>
            <Link href="/dashboard" onClick={()=>setOpen(false)} className="hover:text-blue-400">
              🏠 Dashboard
            </Link>
          </li>

          {user?.role === "ADMIN" && (
            <li>
              <Link href="/users" onClick={()=>setOpen(false)} className="hover:text-blue-400">
                👥 User Management
              </Link>
            </li>
          )}

          <li>
            <Link href="/profile" onClick={()=>setOpen(false)} className="hover:text-blue-400">
              👤 Profile
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}