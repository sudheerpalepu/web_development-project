import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    api
      .get("/dashboard/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDashboard(res.data));
  }, []);

  if (!dashboard) {
    return <p>Please login to view profile.</p>;
  }

  return (
    <div className="page">
      <h1>Profile</h1>
      <div className="card">
        <p>Name: {dashboard.user.name}</p>
        <p>Email: {dashboard.user.email}</p>
        <p>Role: {dashboard.user.role}</p>
      </div>
    </div>
  );
}

export default Profile;