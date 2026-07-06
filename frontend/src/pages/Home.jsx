import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <div className="hero-card">
        <h1 className="page-title">Career Guide Dashboard</h1>
        <p>
          Explore career domains, job demand, salary ranges, predictions, saved
          jobs, and personalized recommendations from one responsive dashboard.
        </p>
        <div>
          <Link className="button-link" to="/search">
            Search Careers
          </Link>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Career insights</h3>
          <p>
            Compare demand, future scope, salary ranges, and live openings for
            domains such as Data Science, Cloud, AI, and Cyber Security.
          </p>
        </div>

        <div className="card">
          <h3>Saved opportunities</h3>
          <p>
            Keep important careers and jobs in your favorites so you can review
            them quickly from desktop, tablet, or phone.
          </p>
        </div>

        <div className="card">
          <h3>Visual dashboard</h3>
          <p>
            Track your profile, saved activity, and progress with clean charts
            that resize smoothly across screens.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
