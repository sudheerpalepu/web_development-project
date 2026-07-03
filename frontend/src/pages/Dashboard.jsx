import { useEffect, useState } from "react";
import api from "../services/api";
import StatsCard from "../components/StatsCard";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await api.get("/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboard(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!dashboard) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <div>

      <h1>Dashboard</h1>

      <div className="stats-grid">

        <StatsCard
          title="Saved Careers"
          value={dashboard.saved_careers}
        />

        <StatsCard
          title="Saved Jobs"
          value={dashboard.saved_jobs}
        />

        <StatsCard
          title="Total Jobs"
          value={dashboard.total_jobs_in_database}
        />

        <StatsCard
          title="Role"
          value={dashboard.user.role}
        />

      </div>

      <div className="card">

        <h2>User Details</h2>

        <p><b>Name:</b> {dashboard.user.name}</p>

        <p><b>Email:</b> {dashboard.user.email}</p>

      </div>

    </div>
  );
}

export default Dashboard;