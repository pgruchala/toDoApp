"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import apiClient from "../clients/apiClient";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalProjects: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch tasks and projects
      const [tasksResponse, projectsResponse] = await Promise.all([
        apiClient.get("/tasks"),
        apiClient.get("/projects"),
      ]);

      const tasks = tasksResponse.data.tasks || tasksResponse.data || [];
      const projects =
        projectsResponse.data.projects || projectsResponse.data || [];

      // Calculate stats
      const completedTasks = tasks.filter(
        (task) => task.status === "completed"
      ).length;
      const pendingTasks = tasks.filter(
        (task) => task.status === "pending"
      ).length;

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        totalProjects: projects.length,
      });

      // Set recent tasks (last 5)
      const sortedTasks = tasks.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentTasks(sortedTasks.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return badges[priority] || "bg-gray-100 text-gray-800";
  };
  return (
    <ProtectedRoute>
      <div>siema</div>
    </ProtectedRoute>
  );
}
