import { useState } from "react";
import api from "../services/api";

function Predictions() {
  const [domain, setDomain] = useState("Data Science");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const searchCareer = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      setMessage("Searching career data...");
      setResult(null);

      const response = await api.get(`/search/${domain}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(response.data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to load career data. Please try again.");
    }
  };

  return (
    <div>
      <h2>Career Search & Prediction</h2>

      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Example: Cyber Security"
      />

      <button onClick={searchCareer}>Search Career</button>

      {message && <p>{message}</p>}

      {result && (
        <div>
          <h3>{result.domain}</h3>
          <p>Total Jobs: {result.total_jobs}</p>
          <p>Average Salary: {result.average_salary}</p>
          <p>Career Score: {result.career_score}</p>
          <p>Future Scope: {result.future_scope}</p>
          <p>{result.recommendation}</p>

          <h3>Jobs</h3>

          {result.jobs.map((job) => (
            <div key={job._id}>
              <h4>{job.title}</h4>
              <p>Company: {job.company}</p>
              <p>Location: {job.location}</p>
              <p>
                Salary: {job.salary_min || "N/A"} - {job.salary_max || "N/A"}
              </p>
              {job.redirect_url && (
                <a href={job.redirect_url} target="_blank">
                  View Job
                </a>
              )}
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Predictions;