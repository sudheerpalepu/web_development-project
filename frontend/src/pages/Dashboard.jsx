import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    api
      .get("/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setDashboard(response.data);
      })
      .catch((error) => {
        console.error(error);
        localStorage.removeItem("token");
      });
  }, []);

  if (!localStorage.getItem("token")) {
    return <p>Please login to view dashboard.</p>;
  }

  if (!dashboard) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <h2>Career Guide Dashboard</h2>
      <p>Name: {dashboard.user.name}</p>
      <p>Email: {dashboard.user.email}</p>
      <p>Saved Careers: {dashboard.saved_careers}</p>
      <p>Saved Jobs: {dashboard.saved_jobs}</p>
      <p>Total Jobs: {dashboard.total_jobs_in_database}</p>
    </div>
  );
}

export default Dashboard;