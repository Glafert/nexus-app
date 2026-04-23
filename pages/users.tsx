import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER",
  });
  const [editId, setEditId] = useState<number | null>(null);

  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  // ======================
  // LOAD USERS
  // ======================
  const loadUsers = async () => {
    const token = getToken();

    const res = await axios.get("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUsers(res.data);
  };

  // ======================
  // AUTH CHECK (ADMIN ONLY)
  // ======================
  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1]));

      if (decoded.role !== "ADMIN") {
        alert("Akses hanya untuk ADMIN");
        router.push("/dashboard");
        return;
      }

      loadUsers();
    } catch {
      router.push("/");
    }
  }, []);

  // ======================
  // ADD USER
  // ======================
  const addUser = async () => {
    const token = getToken();

    await axios.post("/api/users", form, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setForm({ username: "", password: "", role: "USER" });
    loadUsers();
  };

  // ======================
  // START EDIT
  // ======================
  const startEdit = (u: any) => {
    setEditId(u.id);
    setForm({
      username: u.username,
      password: u.password,
      role: u.role,
    });
  };

  // ======================
  // UPDATE USER
  // ======================
  const updateUser = async () => {
    if (!confirm("Update user?")) return;

    const token = getToken();

    await axios.put(`/api/users/${editId}`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setEditId(null);
    setForm({ username: "", password: "", role: "USER" });
    loadUsers();
  };

  // ======================
  // DELETE USER
  // ======================
  const deleteUser = async (id: number) => {
    if (!confirm("Delete user?")) return;

    const token = getToken();

    await axios.delete(`/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadUsers();
  };

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      {/* FORM */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4 flex gap-2 flex-wrap">
        <input
          className="border p-2"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="border p-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        {editId ? (
          <button
            onClick={updateUser}
            className="bg-green-500 text-white px-4 rounded"
          >
            Update
          </button>
        ) : (
          <button
            onClick={addUser}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Add
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td>{u.id}</td>

                {/* 🔗 LINK KE DETAIL */}
                <td>
                  <Link
                    href={`/users/${u.id}`}
                    className="text-blue-500 underline"
                  >
                    {u.username}
                  </Link>
                </td>

                <td>{u.role}</td>

                <td className="space-x-2">
                  <button
                    onClick={() => startEdit(u)}
                    className="bg-yellow-500 text-white px-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}