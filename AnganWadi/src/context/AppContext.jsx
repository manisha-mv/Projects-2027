import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, childrenAPI, attendanceAPI } from "../api/api.js";

const AppContext = createContext(null);

export function AppProvider({ children: reactChildren }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");
  const [childrenData, setChildrenData] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(user);
        setPage(user.role === "admin" ? "dashboard" : "parentDashboard");
        loadData();
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [childrenRes, attendanceRes] = await Promise.all([
        childrenAPI.getAll().catch(() => ({ data: [] })),
        attendanceAPI.getAll().catch(() => ({ data: [] }))
      ]);
      setChildrenData(childrenRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ username, password });
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      setPage(res.data.user.role === "admin" ? "dashboard" : "parentDashboard");
      await loadData();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setPage("login");
    setSelectedChildId(null);
    setChildrenData([]);
    setAttendance([]);
  };

  const register = async (username, password, role, name = username, nameTa = "") => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.register({ username, password, role, name, nameTa });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed. Please check if the server is running.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const addChild = async (child) => {
    setLoading(true);
    setError(null);
    try {
      const newChild = {
        ...child,
        prevHeight: child.height,
        prevWeight: child.weight,
        status: getStatus(child.age, child.weight),
        vaccinations: [],
        nutrition: "No nutrition notes yet.",
        alerts: [],
      };
      const res = await childrenAPI.create(newChild);
      setChildrenData(prev => [...prev, res.data]);
      // Add to attendance if needed
      await attendanceAPI.mark(res.data._id, 'present');
      await loadData(); // Refresh
    } catch (err) {
      setError('Failed to add child');
    } finally {
      setLoading(false);
    }
  };

  const updateChild = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      // Only recompute status if age and weight are both present in the update
      const dataToSend = { ...updatedData };
      if (updatedData.age !== undefined && updatedData.weight !== undefined) {
        dataToSend.status = getStatus(updatedData.age, updatedData.weight);
      }
      const res = await childrenAPI.update(id, dataToSend);
      setChildrenData(prev => prev.map(c => (c._id === id || c.id === id) ? res.data : c));
      await loadData();
    } catch (err) {
      setError('Failed to update child');
    } finally {
      setLoading(false);
    }
  };

  const deleteChild = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await childrenAPI.delete(id);
      setChildrenData(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError('Failed to delete child');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (childId, status, date, nextVisitDate) => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceAPI.mark(childId, status, date, nextVisitDate);
      setAttendance(prev => {
        const idx = prev.findIndex(a => a.childId === childId && a.date === date);
        if (idx !== -1) {
          const newAtt = [...prev];
          newAtt[idx] = res.data;
          return newAtt;
        }
        return [...prev, res.data];
      });
      await loadData();
    } catch (err) {
      setError('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const addAttendanceRecord = async ({ childId, name, date, day, status, nextVisitDate }) => {
    await markAttendance(childId, status, date, nextVisitDate);
    // Refreshing data handled by markAttendance
  };

  function getStatus(age, weight) {
    const thresholds = { 1: 7.7, 2: 10.0, 3: 11.3, 4: 12.7, 5: 14.0 };
    const ageKey = Math.min(Math.max(Math.round(age), 1), 5);
    const threshold = thresholds[ageKey] || 11;
    if (weight < threshold * 0.75) return "underweight";
    if (weight < threshold * 0.9) return "attention";
    return "normal";
  }

  const value = {
    currentUser,
    page,
    setPage,
    childrenData,
    attendance,
    attendanceRecords,
    selectedChildId,
    setSelectedChildId,
    login,
    logout,
    register,
    addChild,
    updateChild,
    deleteChild,
    markAttendance,
    addAttendanceRecord,
    loading,
    error,
    refetch: loadData,
  };

  return <AppContext.Provider value={value}>{reactChildren}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}

