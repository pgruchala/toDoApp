"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import apiClient from "../clients/apiClient";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [userStats, setUserStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    totalProjects: 0,
    tasksByPriority: {
      low: 0,
      medium: 0,
      high: 0,
    },
  });
  const [serviceStats, setServiceStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [isLoading, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userStatsResponse = await apiClient.get("/stats/user");
      setUserStats(userStatsResponse.data.userStats);

      if (isAdmin) {
        try {
          const serviceStatsResponse = await apiClient.get("/stats/service");
          setServiceStats(serviceStatsResponse.data);
          console.log(serviceStatsResponse.data);
        } catch (adminError) {
          console.error("Error fetching service stats:", adminError);
        }
      }

      try {
        const tasksResponse = await apiClient.get("/tasks");
        const tasks = tasksResponse.data.tasks || tasksResponse.data || [];
        const sortedTasks = tasks
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentTasks(sortedTasks);
      } catch (tasksError) {
        console.error("Error fetching recent tasks:", tasksError);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Błąd podczas pobierania danych dashboardu");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-green-100 text-green-800 border-green-300",
    };
    return badges[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: "bg-green-100 text-green-800 border-green-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      high: "bg-red-100 text-red-800 border-red-300",
    };
    return badges[priority] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getCompletionPercentage = () => {
    if (userStats.totalTasks === 0) return 0;
    return Math.round((userStats.completedTasks / userStats.totalTasks) * 100);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Ładowanie dashboardu...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Witaj, {user?.firstName || user?.username}!
            </h1>
            <p className="mt-2 text-gray-600">
              Oto przegląd Twoich zadań i projektów
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Wszystkie zadania
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userStats.totalTasks}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ukończone
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userStats.completedTasks}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        W toku
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userStats.inProgressTasks}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Projekty
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userStats.totalProjects}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Postęp zadań
              </h3>
              <span className="text-sm text-gray-500">
                {getCompletionPercentage()}% ukończone
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Zadania według priorytetu
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Wysoki priorytet
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {userStats.tasksByPriority.high}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Średni priorytet
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {userStats.tasksByPriority.medium}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Niski priorytet</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {userStats.tasksByPriority.low}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ostatnie zadania
              </h3>
              {recentTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Brak zadań do wyświetlenia
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title || "Bez tytułu"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleDateString(
                                "pl-PL"
                              )
                            : "Brak daty"}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        {task.priority && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel administratora */}
          {isAdmin && serviceStats && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Panel administratora - Statystyki serwisu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900">
                    Użytkownicy
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {serviceStats.detailed.users.data.stats.totalUsers || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">
                    Zadania
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {serviceStats.detailed.tasks.data.stats.totalTasks || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900">
                    Projekty
                  </h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {serviceStats.detailed.projects.data.stats.totalProjects ||
                      0}
                  </p>
                </div>
              </div>

              {/* Status serwisów */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Status serwisów
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {serviceStats.summary?.servicesStatus &&
                    Object.entries(serviceStats.summary.servicesStatus).map(
                      ([service, status]) => (
                        <div
                          key={service}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="text-sm text-gray-700 capitalize">
                            {service.replace("Service", "")}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              status === "online"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>

              {/* Szczegółowe błędy serwisów */}
              {serviceStats.detailed && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Szczegóły serwisów
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(serviceStats.detailed).map(
                      ([service, data]) =>
                        data.error && (
                          <div
                            key={service}
                            className="bg-red-50 border border-red-200 rounded p-3"
                          >
                            <p className="text-sm text-red-800">
                              <strong>{service}:</strong> {data.error}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
