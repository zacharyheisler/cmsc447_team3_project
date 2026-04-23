import AdminDashboard from "./Dashboards/AdminDashboard";
import AgentDashboard from "./Dashboards/AgentDashboard";
import UserDashboard from "./Dashboards/UserDashboard/UserDashboard";

export default function Dashboard() {
  // For Demo purposes
  const role = sessionStorage.getItem("USER_ROLE");

	if (role === "admin") {
		return <AdminDashboard />;
	}
	if (role === "user") {
		return <UserDashboard />;
	}
	if (role === "agent") {
		return <AgentDashboard />;
	}

	return <h1>PAGE DOES NOT EXIST</h1>;
}