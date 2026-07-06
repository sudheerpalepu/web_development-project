import { NavLink } from "react-router-dom";

function Sidebar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      <h2>Career Guide</h2>

      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/search">Career Search</NavLink>
        <NavLink to="/favorites">Favorites</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        <button onClick={logout}>Logout</button>
      </nav>
    </aside>
  );
}

export default Sidebar;
