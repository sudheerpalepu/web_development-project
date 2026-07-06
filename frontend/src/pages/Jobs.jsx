import { useEffect, useState } from "react";
import api from "../services/api";

const requirementKeywords = [
  "python",
  "javascript",
  "react",
  "node",
  "sql",
  "mongodb",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "machine learning",
  "data analysis",
  "communication",
  "leadership",
  "project management",
  "problem solving",
  "degree",
  "experience",
  "remote",
];

function formatSalary(min, max) {
  if (!min && !max) return "Not specified";
  if (min && max) return `${min} - ${max}`;
  return min || max;
}

function getRequirementMatches(job) {
  const searchableText = [
    job.title,
    job.domain,
    job.description,
    job.category,
    job.contract_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matches = requirementKeywords.filter((keyword) =>
    searchableText.includes(keyword)
  );

  return matches.length
    ? matches.slice(0, 6)
    : ["Review full description", "Relevant experience", "Role-specific skills"];
}

function groupCount(jobs, key) {
  return jobs.reduce((counts, job) => {
    const label = job[key] || "Not specified";
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {});
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddJob, setShowAddJob] = useState(false);
  const [addJobLoading, setAddJobLoading] = useState(false);
  const [addJobMessage, setAddJobMessage] = useState("");
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    domain: "Data Science",
    location: "",
    salary_min: "",
    salary_max: "",
    contract_type: "",
    description: "",
  });
  const [applicationJobId, setApplicationJobId] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

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
        setError("Unable to load jobs right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateNewJob = (event) => {
    const { name, value } = event.target;

    setNewJob((currentJob) => ({
      ...currentJob,
      [name]: value,
    }));
  };

  const addManualJob = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setAddJobMessage("Please log in before adding a job.");
      return;
    }

    setAddJobLoading(true);
    setAddJobMessage("");

    try {
      const payload = {
        ...newJob,
        salary_min: newJob.salary_min ? Number(newJob.salary_min) : null,
        salary_max: newJob.salary_max ? Number(newJob.salary_max) : null,
      };

      const response = await api.post("/jobs/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs((currentJobs) => [response.data.job, ...currentJobs]);
      setNewJob({
        title: "",
        company: "",
        domain: "Data Science",
        location: "",
        salary_min: "",
        salary_max: "",
        contract_type: "",
        description: "",
      });
      setAddJobMessage("Job added successfully.");
      setShowAddJob(false);
    } catch (error) {
      console.error(error);
      setAddJobMessage(
        error.response?.data?.detail || "Unable to add this job right now."
      );
    } finally {
      setAddJobLoading(false);
    }
  };

  const markApplied = async (job) => {
    const token = localStorage.getItem("token");

    if (!token || job.has_applied) return false;

    try {
      await api.patch(
        `/jobs/${job._id}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob._id === job._id
            ? {
                ...currentJob,
                has_applied: true,
                applied_count: (currentJob.applied_count || 0) + 1,
              }
            : currentJob
        )
      );
      return true;
    } catch (error) {
      console.error(error);
      setError("Could not mark this job as applied.");
      return false;
    }
  };

  const handleApplyClick = async (job) => {
    setApplicationJobId(job._id);
    setResumeAnalysis(null);
    setResumeFileName("");
    setResumeError("");

    if (!job.has_applied) {
      await markApplied(job);
    }
  };

  const handleApplicationResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem("token");

    if (!file) return;

    if (!token) {
      setResumeError("Please log in before uploading your resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setResumeFileName(file.name);
    setResumeLoading(true);
    setResumeError("");
    setResumeAnalysis(null);

    try {
      const response = await api.post("/resume/analyze", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResumeAnalysis(response.data);
    } catch (error) {
      setResumeError(
        error.response?.data?.detail ||
          "Unable to analyze this resume. Please try another file."
      );
    } finally {
      setResumeLoading(false);
      event.target.value = "";
    }
  };

  const vacanciesByDomain = groupCount(jobs, "domain");
  const vacanciesByCompany = Object.entries(groupCount(jobs, "company"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const appliedJobs = jobs.filter((job) => job.has_applied).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Job Applications</h1>
        <p>
          Browse current saved vacancies, review the requirements, and apply to
          the roles that match your skills.
        </p>
        <button type="button" onClick={() => setShowAddJob((show) => !show)}>
          {showAddJob ? "Close Add Job" : "Add Job"}
        </button>
      </div>

      {showAddJob && (
        <div className="card">
          <h2>Add Job</h2>
          <form className="add-job-form" onSubmit={addManualJob}>
            <div className="form-grid">
              <label>
                Job title
                <input
                  name="title"
                  value={newJob.title}
                  onChange={updateNewJob}
                  placeholder="Example: Data Analyst"
                  required
                />
              </label>

              <label>
                Company
                <input
                  name="company"
                  value={newJob.company}
                  onChange={updateNewJob}
                  placeholder="Example: Acme Analytics"
                  required
                />
              </label>

              <label>
                Domain
                <select
                  name="domain"
                  value={newJob.domain}
                  onChange={updateNewJob}
                  required
                >
                  <option>Data Science</option>
                  <option>Software Developer</option>
                  <option>Cloud</option>
                  <option>Cyber Security</option>
                  <option>AI</option>
                  <option>UI UX Designer</option>
                  <option>Project Manager</option>
                </select>
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={newJob.location}
                  onChange={updateNewJob}
                  placeholder="Example: Dublin"
                />
              </label>

              <label>
                Minimum salary
                <input
                  name="salary_min"
                  type="number"
                  min="0"
                  value={newJob.salary_min}
                  onChange={updateNewJob}
                  placeholder="Example: 45000"
                />
              </label>

              <label>
                Maximum salary
                <input
                  name="salary_max"
                  type="number"
                  min="0"
                  value={newJob.salary_max}
                  onChange={updateNewJob}
                  placeholder="Example: 70000"
                />
              </label>

              <label>
                Contract type
                <input
                  name="contract_type"
                  value={newJob.contract_type}
                  onChange={updateNewJob}
                  placeholder="Example: Permanent"
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={newJob.description}
                onChange={updateNewJob}
                rows="4"
                placeholder="Add role requirements, skills, and responsibilities"
              />
            </label>

            {addJobMessage && <div className="inline-alert">{addJobMessage}</div>}

            <button type="submit" disabled={addJobLoading}>
              {addJobLoading ? "Adding..." : "Save Job"}
            </button>
          </form>
        </div>
      )}

      <div className="stats-grid">
        <div className="stats-card">
          <h3>Total Vacancies</h3>
          <h1>{jobs.length}</h1>
        </div>
        <div className="stats-card">
          <h3>Applied Jobs</h3>
          <h1>{appliedJobs}</h1>
        </div>
        <div className="stats-card">
          <h3>Career Domains</h3>
          <h1>{Object.keys(vacanciesByDomain).length}</h1>
        </div>
      </div>

      {Object.keys(vacanciesByDomain).length > 0 && (
        <div className="card">
          <h2>Vacancies by Career Area</h2>
          <div className="vacancy-list">
            {Object.entries(vacanciesByDomain).map(([domain, count]) => (
              <div className="vacancy-row" key={domain}>
                <span>{domain}</span>
                <strong>{count} vacancies</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {vacanciesByCompany.length > 0 && (
        <div className="card">
          <h2>Top Hiring Companies</h2>
          <div className="vacancy-list">
            {vacanciesByCompany.map(([company, count]) => (
              <div className="vacancy-row" key={company}>
                <span>{company}</span>
                <strong>{count} jobs</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading jobs...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">No jobs saved yet.</div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div className="card job-card" key={job._id}>
              <div className="job-card-header">
                <div>
                  <h3>{job.title || "Untitled role"}</h3>
                  <p>{job.company || "Company not specified"}</p>
                </div>
                <span className={job.has_applied ? "status applied" : "status"}>
                  {job.has_applied ? "Applied" : "Open"}
                </span>
              </div>

              <div className="job-meta-grid">
                <p>
                  <b>Domain:</b> {job.domain || "N/A"}
                </p>
                <p>
                  <b>Location:</b> {job.location || "N/A"}
                </p>
                <p>
                  <b>Salary:</b> {formatSalary(job.salary_min, job.salary_max)}
                </p>
                <p>
                  <b>Contract:</b> {job.contract_type || "Not specified"}
                </p>
              </div>

              <div className="requirements">
                <h4>Requirements to meet</h4>
                <ul>
                  {getRequirementMatches(job).map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              </div>

              {job.description && (
                <p className="job-description">
                  {job.description.replace(/<[^>]+>/g, "").slice(0, 180)}
                  {job.description.length > 180 ? "..." : ""}
                </p>
              )}

              <div className="job-actions">
                <button
                  type="button"
                  onClick={() => handleApplyClick(job)}
                >
                  {job.has_applied ? "View Application" : "Apply Now"}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => markApplied(job)}
                  disabled={job.has_applied}
                >
                  {job.has_applied ? "Marked Applied" : "Mark Applied"}
                </button>
              </div>

              {applicationJobId === job._id && (
                <div className="application-upload-panel">
                  <div>
                    <h4>Upload Resume</h4>
                    <p>
                      Add your resume here to get matching skills and role
                      recommendations before submitting your application.
                    </p>
                  </div>

                  <label
                    className={`upload-button ${
                      resumeLoading ? "is-disabled" : ""
                    }`}
                  >
                    {resumeLoading ? "Analyzing..." : "Choose Resume"}
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.docx,.txt"
                      disabled={resumeLoading}
                      onChange={handleApplicationResumeUpload}
                    />
                  </label>

                  {resumeFileName && (
                    <p className="muted">Selected: {resumeFileName}</p>
                  )}

                  {resumeError && (
                    <div className="inline-alert error">{resumeError}</div>
                  )}

                  {!resumeAnalysis && !resumeError && (
                    <div className="inline-alert">
                      Resume recommendations will appear here after upload.
                    </div>
                  )}

                  {resumeAnalysis && (
                    <div className="resume-results">
                      <div className="inline-alert success">
                        {resumeAnalysis.summary}
                      </div>

                      <div className="skill-chip-list">
                        {(resumeAnalysis.matched_skills || []).length ? (
                          resumeAnalysis.matched_skills.map((skill) => (
                            <span className="skill-chip" key={skill}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="skill-chip">No skills detected yet</span>
                        )}
                      </div>

                      {(resumeAnalysis.recommendations || []).length > 0 && (
                        <div className="recommendation-list">
                          {resumeAnalysis.recommendations
                            .slice(0, 3)
                            .map((item) => (
                              <div
                                className="recommendation-item"
                                key={item.domain}
                              >
                                <strong>{item.domain}</strong>
                                <span>{item.reason}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
