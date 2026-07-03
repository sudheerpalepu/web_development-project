import { useEffect, useState } from "react";
import api from "../services/api";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    api
      .get("/jobs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setJobs(response.data.jobs);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="page">
      <h1>Saved Jobs Database</h1>

      {jobs.length === 0 ? (
        <p>No jobs saved yet.</p>
      ) : (
        jobs.map((job) => (
          <div className="card" key={job._id}>
            <h3>{job.title}</h3>
            <p><b>Domain:</b> {job.domain}</p>
            <p><b>Company:</b> {job.company || "N/A"}</p>
            <p><b>Location:</b> {job.location || "N/A"}</p>
            <p><b>Salary:</b> {job.salary_min || "N/A"} - {job.salary_max || "N/A"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Jobs;