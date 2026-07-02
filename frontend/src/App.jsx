import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>Career Guide Dashboard</h1>

      <Register />
      <hr />

      <Login />
      <hr />

      <Dashboard />
    </div>
  );
}

export default App;