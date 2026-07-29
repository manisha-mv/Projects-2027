import { AppProvider, useApp } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AddChild from "./pages/AddChild";
import ChildManagement from "./pages/ChildManagement";
import ChildDetails from "./pages/ChildDetails";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import ParentDashboard from "./pages/ParentDashboard";
import AdminLayout from "./components/AdminLayout";
import "./App.css";

function Router() {
  const { page, currentUser } = useApp();

  if (!currentUser) {
    if (page === "register") return <Register />;
    return <Login />;
  }

  if (currentUser.role === "parent") {
    if (page === "childDetails") return <ChildDetails isParent={true} />;
    return <ParentDashboard />;
  }

  // Admin pages
  const adminPages = {
    dashboard: <AdminDashboard />,
    addChild: <AddChild />,
    childManagement: <ChildManagement />,
    childDetails: <ChildDetails isParent={false} />,
    attendance: <Attendance />,
    reports: <Reports />,
  };

  return (
    <AdminLayout page={page}>
      {adminPages[page] || <AdminDashboard />}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </LanguageProvider>
  );
}
