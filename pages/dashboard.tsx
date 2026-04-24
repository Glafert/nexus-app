import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TodoBoard from "../components/TodoBoard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    tasksByUser: {},
  });

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // 🔥 ambil user
        const userRes = await fetch("/api/users/public");
        const userData = await userRes.json();
        setUsers(userData);

        // 🔥 ambil board
        const res = await fetch("/api/board");
        const data = await res.json();

        if (!data || !data.columns) return;

        let totalTasks = 0;
        const taskCount: any = {};

        Object.values(data.columns).forEach((col: any) => {
          col.items.forEach((task: any) => {
            totalTasks++;

            let pics: any[] = [];

            if (Array.isArray(task.pic)) {
              pics = task.pic;
            } else if (typeof task.pic === "string" && task.pic !== "") {
              try {
                const parsed = JSON.parse(task.pic);
                pics = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                pics = [task.pic];
              }
            } else if (typeof task.pic === "number") {
              pics = [task.pic];
            }

            pics.forEach((p: any) => {
              const key = String(p);
              taskCount[key] = (taskCount[key] || 0) + 1;
            });

          });
        });

        setStats({
          totalTasks,
          tasksByUser: taskCount,
        });

      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  // 🔥 mapping user biar cepat
  const userMap = Object.fromEntries(
    users.map((u) => [String(u.id), u])
  );

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        Dashboard Overview
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
          padding: "0 4px",
        }}
      >
        <Card title="Total Tasks" value={stats.totalTasks} />

        {/* 🔥 CARD LIST PIC */}
          <div
            className="
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              p-5 rounded-xl shadow min-h-[120px]
            "
          >
          <h2
            className="text-sm text-gray-500 dark:text-gray-300"
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Task per PIC
          </h2>

          {Object.keys(stats.tasksByUser).length === 0 && (
            <div className="text-sm text-gray-400">
              No data
            </div>
          )}

          {Object.entries(stats.tasksByUser).map(([userId, count]: any) => {
            const user = userMap[userId];

            return (
              <div
                key={userId}
                className="flex justify-between text-sm mb-1"
              >
                <span>{user?.username || "Unknown"}</span>
                <b>{count}</b>
              </div>
            );
          })}
        </div>

        <Card title="System" value="OK" />
      </div>

      <TodoBoard />
    </Layout>
  );
}

/* CARD */
function Card({ title, value }) {
  return (
    <div
      className="
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        p-5 rounded-xl shadow
        flex flex-col justify-center
        min-h-[120px]
        transition
      "
    >
      <h2 className="text-sm text-gray-500 dark:text-gray-300 mb-1">
        {title}
      </h2>

      <p className="text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}