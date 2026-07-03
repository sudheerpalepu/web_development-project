import { useEffect, useState } from "react";
import api from "../services/api";

function Favorites() {
  const [careers, setCareers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const loadFavorites = async () => {
    if (!token) {
      setMessage("Please login to view favorites.");
      return;
    }

    try {
      const careerResponse = await api.get("/favorites/career", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const jobResponse = await api.get("/favorites/job", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCareers(careerResponse.data);
      setJobs(jobResponse.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load favorites.");
    }
  };

  const deleteFavorite = async (favoriteId) => {
    try {
      await api.delete(`/favorites/${favoriteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Favorite deleted.");
      loadFavorites();
    } catch (error) {
      console.error(error);
      alert("Unable to delete favorite.");
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="page">
      <h1>Favorites</h1>

      {message && <p>{message}</p>}

      <div className="card">
        <h2>Favorite Careers</h2>

        {careers.length === 0 ? (
          <p>No favorite careers saved yet.</p>
        ) : (
          careers.map((career) => (
            <div className="favorite-item" key={career._id}>
              <div>
                <h3>{career.domain}</h3>
                <p>Saved career domain</p>
              </div>

              <button onClick={() => deleteFavorite(career._id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2>Favorite Jobs</h2>

        {jobs.length === 0 ? (
          <p>No favorite jobs saved yet.</p>
        ) : (
          jobs.map((job) => (
            <div className="favorite-item" key={job._id}>
              <div>
                <h3>{job.title}</h3>
                <p><b>Company:</b> {job.company}</p>
                <p><b>Location:</b> {job.location}</p>
              </div>

              <button onClick={() => deleteFavorite(job._id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Favorites;