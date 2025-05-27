"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import apiClient from "../clients/apiClient";
import ProtectedRoute from "../components/ProtectedRoute";

import FileInput from "../components/FileInput";
import ExportTasks from "../components/ExportTasks";
import { useAuth } from "../context/AuthContext";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
    projectId: "",
  });
  const [projectFilter, setProjectFilter] = useState("");
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchTasks(currentPage);
    fetchProjects();
  }, []);

  const fetchTasks = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (projectFilter) params.append("projectId", projectFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await apiClient.get(`/tasks?${params.toString()}`);
      setTasks(response.data.tasks);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTasks(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, priorityFilter, projectFilter]);

  useEffect(() => {
    if (!loading) {
      fetchTasks(currentPage);
    }
  }, [currentPage, limit]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...taskForm };
      if (taskData.assignedTo === "") delete taskData.assignedTo;
      if (taskData.projectId === "") delete taskData.projectId;
      if (taskForm.dueDate) {
        taskData.dueDate = new Date(taskForm.dueDate).toISOString();
      } else {
        delete taskData.dueDate;
      }
      if (editingTask) {
        await apiClient.patch(`/tasks/${editingTask._id}`, taskData);
      } else {
        await apiClient.post("/tasks", taskData);
      }

      setShowTaskModal(false);
      setEditingTask(null);
      resetTaskForm();
      fetchTasks(editingTask ? currentPage : 1);
    } catch (error) {
      console.error("Error saving task:", error);
      alert(
        `Błąd zapisu zadania: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Czy na pewno chcesz usunąć to zadanie?")) {
      try {
        await apiClient.delete(`/tasks/${taskId}`);
        fetchTasks(currentPage);
      } catch (error) {
        console.error("Error deleting task:", error);
        alert(
          `Błąd usuwania zadania: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      projectId: task.projectId || "",
      assignedTo: task.assignedTo || "",
    });
    setShowTaskModal(true);
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: "",
      projectId: "",
      assignedTo: "",
    });
  };

  const priorityMapFromImport = {
    1: "low",
    2: "medium",
    3: "high",
  };

  const handleAddMultipleTasks = async (importedTasks) => {
    if (!importedTasks || importedTasks.length === 0) {
      alert("Plik nie zawiera zadań lub jest pusty.");
      return;
    }
    if (!currentUser || !currentUser.id) {
      alert("Nie można zidentyfikować użytkownika. Import przerwany.");
      setLoading(false);
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const importedTask of importedTasks) {
        if (!importedTask.title || !importedTask.description) {
          console.warn(
            "Pominięto zadanie z powodu braku tytułu lub opisu:",
            importedTask
          );
          errorCount++;
          continue;
        }

        const newTaskData = {
          title: importedTask.title.substring(0, 100),
          description: (
            importedTask.description +
            (importedTask.comment
              ? ` (Komentarz: ${importedTask.comment})`
              : "")
          ).substring(0, 500),
          status: "pending",
          priority:
            priorityMapFromImport[parseInt(importedTask.priority)] || "medium",
          dueDate:
            importedTask.date && !isNaN(new Date(importedTask.date).getTime())
              ? new Date(importedTask.date).toISOString()
              : undefined,
          userId: currentUser.id,
        };

        if (!newTaskData.dueDate) {
          delete newTaskData.dueDate;
        }
        if (!newTaskData.title.trim()) {
          console.warn(
            "Pominięto zadanie z powodu pustego tytułu po przetworzeniu:",
            importedTask
          );
          errorCount++;
          continue;
        }
        if (!newTaskData.description.trim()) {
          console.warn(
            "Pominięto zadanie z powodu pustego opisu po przetworzeniu:",
            importedTask
          );
          errorCount++;
          continue;
        }

        try {
          await apiClient.post("/tasks", newTaskData);
          successCount++;
        } catch (taskError) {
          console.error(
            "Błąd podczas importu pojedynczego zadania:",
            taskError.response?.data || taskError.message,
            importedTask
          );
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Pomyślnie zaimportowano ${successCount} zadań.`);
      }
      if (errorCount > 0) {
        alert(
          `Nie udało się zaimportować ${errorCount} zadań. Sprawdź konsolę, aby uzyskać więcej informacji.`
        );
      }
      fetchTasks(1);
    } catch (error) {
      console.error("Błąd podczas importu zadań:", error);
      alert(`Wystąpił błąd podczas importu zadań: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tasksForExport = tasks.map((task) => ({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    date: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("pl-PL")
      : "",
    status: task.status,
    projectId: task.projectId,
    assignedTo: task.assignedTo,
  }));

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "badge-success";
      case "in-progress":
        return "badge-warning";
      case "pending":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "badge-error";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get("/projects");
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    return project ? project.name : "Bez projektu";
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Moje Zadania</h1>
          <div className="flex items-center space-x-2">
            <FileInput addMultipleTasks={handleAddMultipleTasks} />
            <ExportTasks tasks={tasksForExport} />
            <button
              className="btn btn-primary"
              onClick={() => {
                resetTaskForm();
                setEditingTask(null);
                setShowTaskModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowe Zadanie
            </button>
          </div>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="form-control">
              <div className="input-group">
                <span>
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Szukaj zadań..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              className="select select-bordered w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Wszystkie statusy</option>
              <option value="pending">Oczekujące</option>
              <option value="in-progress">W trakcie</option>
              <option value="completed">Ukończone</option>
            </select>

            <select
              className="select select-bordered w-full"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">Wszystkie priorytety</option>
              <option value="high">Wysoki</option>
              <option value="medium">Średni</option>
              <option value="low">Niski</option>
            </select>

            <select
              className="select select-bordered w-full"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">Wszystkie projekty</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>

            <button
              className="btn btn-outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPriorityFilter("");
                setProjectFilter("");
              }}
            >
              Wyczyść filtry
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              Brak zadań do wyświetlenia
            </h3>
            <p className="text-gray-400">
              Dodaj nowe zadanie, aby rozpocząć pracę
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task._id} className="card bg-base-100 shadow-sm border">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="card-title text-lg">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mt-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span
                          className={`badge ${getStatusBadgeClass(
                            task.status
                          )}`}
                        >
                          {task.status === "pending" && "Oczekujące"}
                          {task.status === "in-progress" && "W trakcie"}
                          {task.status === "completed" && "Ukończone"}
                        </span>
                        <span
                          className={`badge ${getPriorityBadgeClass(
                            task.priority
                          )}`}
                        >
                          {task.priority === "high" && "Wysoki"}
                          {task.priority === "medium" && "Średni"}
                          {task.priority === "low" && "Niski"}
                        </span>
                        {task.projectId && (
                          <span className="badge badge-outline">
                            {getProjectName(task.projectId)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.dueDate).toLocaleDateString("pl-PL")}
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {task.assignedTo}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showTaskModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                {editingTask ? "Edytuj Zadanie" : "Nowe Zadanie"}
              </h3>

              <form onSubmit={handleSubmitTask}>
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Tytuł *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Opis</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    rows="3"
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={taskForm.status}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, status: e.target.value })
                      }
                    >
                      <option value="pending">Oczekujące</option>
                      <option value="in-progress">W trakcie</option>
                      <option value="completed">Ukończone</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Priorytet</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, priority: e.target.value })
                      }
                    >
                      <option value="low">Niski</option>
                      <option value="medium">Średni</option>
                      <option value="high">Wysoki</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Termin</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Projekt</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={taskForm.projectId}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, projectId: e.target.value })
                      }
                    >
                      <option value="">Wybierz projekt</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control w-full mb-6">
                  <label className="label">
                    <span className="label-text">Przypisane do</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Email użytkownika"
                    value={taskForm.assignedTo}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, assignedTo: e.target.value })
                    }
                  />
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowTaskModal(false);
                      setEditingTask(null);
                      resetTaskForm();
                    }}
                  >
                    Anuluj
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? "Zapisz zmiany" : "Dodaj zadanie"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {!loading && tasks.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Poprzednia
            </button>
            <span className="text-sm">
              Strona {currentPage} z {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="btn btn-outline btn-sm"
            >
              Następna
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
