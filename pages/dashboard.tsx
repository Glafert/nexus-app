import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Activity</h2>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-lg font-semibold">System</h2>
          <p className="text-3xl font-bold mt-2">OK</p>
        </div>
      </div>
    </Layout>
  );
}