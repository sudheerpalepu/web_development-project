import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    api
      .get("/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((error) => {
        console.error(error);
        setError("Unable to load profile right now.");
      });
  }, []);

  if (error) {
    return <div className="empty-state">{error}</div>;
  }

  if (!profile) {
    return <div className="empty-state">Please login to view profile.</div>;
  }

  const resumeProfile = profile.resume_profile;
  const matchedSkills = resumeProfile?.matched_skills || [];
  const appliedJobs = profile.applied_jobs || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>
          Your account details, resume skills, and applied jobs in one place.
        </p>
      </div>

      <div className="card">
        <div className="profile-list">
          <div className="profile-row">
            <strong>Name</strong>
            <span>{profile.name}</span>
          </div>
          <div className="profile-row">
            <strong>Email</strong>
            <span>{profile.email}</span>
          </div>
          <div className="profile-row">
            <strong>Role</strong>
            <span>{profile.role}</span>
          </div>
          <div className="profile-row">
            <strong>Applied Jobs</strong>
            <span>{profile.applied_jobs_count || 0}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Resume Skills</h2>

        {!resumeProfile ? (
          <div className="empty-state">
            Upload a resume from Dashboard or Apply to see extracted skills here.
          </div>
        ) : (
          <div className="profile-section">
            <p className="muted">Latest resume: {resumeProfile.filename}</p>
            <div className="inline-alert success">{resumeProfile.summary}</div>

            <div className="skill-chip-list">
              {matchedSkills.length ? (
                matchedSkills.map((skill) => (
                  <span className="skill-chip" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="skill-chip">No skills detected yet</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Applied Jobs</h2>

        {!appliedJobs.length ? (
          <div className="empty-state">
            Applied jobs will appear here after you tap Apply Now.
          </div>
        ) : (
          <div className="applied-jobs-list">
            {appliedJobs.map((job) => (
              <div className="applied-job-item" key={job._id}>
                <div>
                  <h3>{job.title || "Untitled role"}</h3>
                  <p>{job.company || "Company not specified"}</p>
                </div>
                <div className="job-meta-grid">
                  <p>
                    <b>Domain:</b> {job.domain || "N/A"}
                  </p>
                  <p>
                    <b>Location:</b> {job.location || "N/A"}
                  </p>
                  <p>
                    <b>Contract:</b> {job.contract_type || "Not specified"}
                  </p>
                  <p>
                    <b>Applied Count:</b> {job.applied_count || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
