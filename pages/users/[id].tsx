import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);

  const loadUser = async () => {
    if(!id) return;
    const res = await axios.get(`/api/users/${id}`);
    setUser(res.data);
  };

  useEffect(()=>{
    if(id) loadUser();
  },[id]);

  if(!user) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">User Detail</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md">
        <img src={user.avatar || "/avatar.png"} className="w-24 h-24 rounded-full mb-4"/>

        <p>ID: {user.id}</p>
        <p>Username: {user.username}</p>
        <p>Role: {user.role}</p>
      </div>
    </Layout>
  );
}