import { Link } from "react-router-dom";

function Sidebar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <h2>Career Guide</h2>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/search">Career Search</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/jobs">Jobs</Link>
        <button onClick={logout}>Logout</button>
      </nav>
    </aside>
  );
}

export default Sidebar;