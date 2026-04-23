import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username:"", password:"", role:"USER" });
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  const loadUsers = async () => {
    const res = await axios.get("/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  useEffect(()=>{ loadUsers(); },[]);

  const addUser = async () => {
    await axios.post("/api/users", form);
    setForm({ username:"", password:"", role:"USER" });
    loadUsers();
  };

  const startEdit = (u:any) => {
    setEditId(u.id);
    setForm({ username:u.username, password:u.password, role:u.role });
  };

  const updateUser = async () => {
    if(!confirm("Update user?")) return;

    await axios.put(`/api/users/${editId}`, form);
    setEditId(null);
    setForm({ username:"", password:"", role:"USER" });
    loadUsers();
  };

  const deleteUser = async (id:number) => {
    if(!confirm("Delete user?")) return;

    await axios.delete(`/api/users/${id}`);
    loadUsers();
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      {/* FORM BALIK */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4 flex gap-2 flex-wrap">
        <input className="border p-2" placeholder="Username"
          value={form.username}
          onChange={(e)=>setForm({...form, username:e.target.value})}
        />

        <input className="border p-2" placeholder="Password"
          value={form.password}
          onChange={(e)=>setForm({...form, password:e.target.value})}
        />

        <select className="border p-2"
          value={form.role}
          onChange={(e)=>setForm({...form, role:e.target.value})}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        {editId ? (
          <button onClick={updateUser} className="bg-green-500 text-white px-4">Update</button>
        ) : (
          <button onClick={addUser} className="bg-blue-500 text-white px-4">Add</button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u:any)=>(
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  <Link href={`/users/${u.id}`} className="text-blue-500 underline">
                    {u.username}
                  </Link>
                </td>
                <td>{u.role}</td>
                <td className="space-x-2">
                  <button onClick={()=>startEdit(u)} className="bg-yellow-500 text-white px-2">Edit</button>
                  <button onClick={()=>deleteUser(u.id)} className="bg-red-500 text-white px-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}