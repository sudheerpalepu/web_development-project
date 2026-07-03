import { useState } from "react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";

function Predictions() {
  const [domain, setDomain] = useState("Data Science");
  const [result, setResult] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [message, setMessage] = useState("");

  const searchCareer = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setMessage("Searching...");
      setResult(null);
      setSelectedJob(null);

      const response = await api.get(`/search/${domain}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(response.data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to fetch career information.");
    }
  };

  const saveCareer = async () => {
    const token = localStorage.getItem("token");

    try {
      await api.post(
        "/favorites/career",
        { domain: result.domain },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Career saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to save career.");
    }
  };

  const saveJob = async (job) => {
    const token = localStorage.getItem("token");

    try {
      await api.post(
        "/favorites/job",
        {
          job_id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Job saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to save job.");
    }
  };

  const jobsByLocation = () => {
    if (!result) return [];

    const data = {};

    result.jobs.forEach((job) => {
      const location = job.location || "Unknown";
      data[location] = (data[location] || 0) + 1;
    });

    return Object.entries(data)
      .map(([location, jobs]) => ({ location, jobs }))
      .slice(0, 10);
  };

  const salaryByLocation = () => {
    if (!result) return [];

    const data = {};

    result.jobs.forEach((job) => {
      const location = job.location || "Unknown";
      const min = Number(job.salary_min);
      const max = Number(job.salary_max);

      if (!isNaN(min) && !isNaN(max)) {
        if (!data[location]) {
          data[location] = { total: 0, count: 0 };
        }

        data[location].total += (min + max) / 2;
        data[location].count += 1;
      }
    });

    return Object.entries(data)
      .map(([location, value]) => ({
        location,
        salary: Math.round(value.total / value.count),
      }))
      .slice(0, 10);
  };

  const salaryRanges = () => {
    if (!result) return [];

    return result.jobs
      .filter((job) => job.salary_min && job.salary_max)
      .slice(0, 10)
      .map((job) => ({
        title:
          job.title.length > 18
            ? job.title.substring(0, 18) + "..."
            : job.title,
        min: Number(job.salary_min),
        max: Number(job.salary_max),
      }));
  };

  const contractTypes = () => {
    if (!result) return [];

    const data = {};

    result.jobs.forEach((job) => {
      const type = job.contract_type || "Unknown";
      data[type] = (data[type] || 0) + 1;
    });

    return Object.entries(data).map(([type, value]) => ({
      type,
      value,
    }));
  };

  const jobsByDate = () => {
    if (!result) return [];

    const data = {};

    result.jobs.forEach((job) => {
      if (job.created) {
        const date = job.created.substring(0, 10);
        data[date] = (data[date] || 0) + 1;
      }
    });

    return Object.entries(data)
      .map(([date, jobs]) => ({ date, jobs }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <div className="page">
      <h1>Career Search</h1>

      <div className="card">
        <input
          type="text"
          value={domain}
          placeholder="Example: Cyber Security"
          onChange={(e) => setDomain(e.target.value)}
        />

        <button onClick={searchCareer}>Search Career</button>
      </div>

      {message && <h3>{message}</h3>}

      {result && (
        <>
          <div className="stats-grid">
            <div className="stats-card">
              <h3>Total Jobs</h3>
              <h1>{result.total_jobs}</h1>
            </div>

            <div className="stats-card">
              <h3>Average Salary</h3>
              <h1>€{Math.round(result.average_salary)}</h1>
            </div>

            <div className="stats-card">
              <h3>Career Score</h3>
              <h1>{result.career_score}</h1>
            </div>

            <div className="stats-card">
              <h3>Future Scope</h3>
              <h1>{result.future_scope}</h1>
            </div>
          </div>

          <div className="card">
            <h2>{result.domain}</h2>
            <p>{result.recommendation}</p>
            <button onClick={saveCareer}>❤️ Save Career</button>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h2>Jobs by Location</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobsByLocation()}>
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card green">
              <h2>Average Salary by Location</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryByLocation()}>
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="salary" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card purple">
              <h2>Salary Range by Job</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryRanges()}>
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="min" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="max" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card orange">
              <h2>Contract Types</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contractTypes()}
                    dataKey="value"
                    nameKey="type"
                    outerRadius={100}
                    fill="#f97316"
                    label
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card red">
              <h2>Jobs Posted Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={jobsByDate()}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    stroke="#dc2626"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {selectedJob && (
            <div className="card">
              <h2>Job Details</h2>
              <h3>{selectedJob.title}</h3>

              <p>
                <b>Company:</b> {selectedJob.company || "N/A"}
              </p>
              <p>
                <b>Location:</b> {selectedJob.location || "N/A"}
              </p>
              <p>
                <b>Category:</b> {selectedJob.category || "N/A"}
              </p>
              <p>
                <b>Contract Type:</b> {selectedJob.contract_type || "N/A"}
              </p>
              <p>
                <b>Contract Time:</b> {selectedJob.contract_time || "N/A"}
              </p>
              <p>
                <b>Created:</b> {selectedJob.created || "N/A"}
              </p>

              <p>
                <b>Salary:</b> {selectedJob.salary_min || "N/A"} -{" "}
                {selectedJob.salary_max || "N/A"}
              </p>

              <p>
                <b>Description:</b>
              </p>
              <p>{selectedJob.description || "No description available."}</p>

              <button onClick={() => saveJob(selectedJob)}>
                ❤️ Save This Job
              </button>
            </div>
          )}

          <h2>Available Jobs</h2>

          {result.jobs.map((job) => (
            <div className="card" key={job._id}>
              <h3>{job.title}</h3>

              <p>
                <b>Company:</b> {job.company || "N/A"}
              </p>

              <p>
                <b>Location:</b> {job.location || "N/A"}
              </p>

              <p>
                <b>Salary:</b> {job.salary_min || "N/A"} -{" "}
                {job.salary_max || "N/A"}
              </p>

              <button onClick={() => setSelectedJob(job)}>
                View Job Details
              </button>

              <button onClick={() => saveJob(job)}>❤️ Save Job</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Predictions;