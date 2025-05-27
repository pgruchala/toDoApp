"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle
} from "lucide-react";
import apiClient from "../../clients/apiClient";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function ProjectDetailsPage({ params }) {
  const router = useRouter();
  const { id: projectId } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [memberInput, setMemberInput] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchProjectTasks();
    }
  }, [projectId]);

  // Sprawdź czy użytkownik jest właścicielem projektu
  const isProjectOwner = () => {
    if (!project || !user) return false;
    return project.userId === user.id;
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/projects/${projectId}`);
      setProject(response.data.project);
      setProjectForm({
        name: response.data.project.name,
        description: response.data.project.description || "",
        members: response.data.project.members || [],
      });
    } catch (error) {
      console.error("Error fetching project details:", error);
      if (error.response?.status === 404) {
        router.push('/projects');
      } else if (error.response?.status === 403) {
        alert("Nie masz uprawnień do wyświetlenia tego projektu");
        router.push('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await apiClient.get(`/tasks?projectId=${projectId}`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...projectForm,
        members: projectForm.members.filter((member) => member.trim() !== ""),
      };

      await apiClient.patch(`/projects/${projectId}`, projectData);
      setShowEditModal(false);
      fetchProjectDetails();
    } catch (error) {
      console.error("Error updating project:", error);
      if (error.response?.status === 403) {
        alert("Nie masz uprawnień do edycji tego projektu");
      }
    }
  };

  const handleDeleteProject = async () => {
    if (
      confirm(
        "Czy na pewno chcesz usunąć ten projekt? Wszystkie powiązane zadania pozostaną bez projektu."
      )
    ) {
      try {
        await apiClient.delete(`/projects/${projectId}`);
        router.push('/projects');
      } catch (error) {
        console.error("Error deleting project:", error);
        if (error.response?.status === 403) {
          alert("Nie masz uprawnień do usunięcia tego projektu");
        }
      }
    }
  };

  const addMember = () => {
    if (
      memberInput.trim() &&
      !projectForm.members.includes(memberInput.trim())
    ) {
      setProjectForm({
        ...projectForm,
        members: [...projectForm.members, memberInput.trim()],
      });
      setMemberInput("");
    }
  };

  const removeMember = (memberToRemove) => {
    setProjectForm({
      ...projectForm,
      members: projectForm.members.filter(
        (member) => member !== memberToRemove
      ),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTaskStatusBadge = (status) => {
    const statusMap = {
      'completed': 'badge-success',
      'in-progress': 'badge-info',
      'urgent': 'badge-error',
      'pending': 'badge-warning'
    };
    return statusMap[status] || 'badge-ghost';
  };

  const getTaskStatusText = (status) => {
    const statusMap = {
      'completed': 'Ukończone',
      'in-progress': 'W trakcie',
      'urgent': 'Pilne',
      'pending': 'Oczekujące'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              Projekt nie został znaleziony
            </h3>
            <Link href="/projects">
              <button className="btn btn-primary">
                Powrót do projektów
              </button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const projectOwner = isProjectOwner();

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <button className="btn btn-ghost btn-sm">
                <ArrowLeft className="w-4 h-4" />
                Powrót
              </button>
            </Link>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {!projectOwner && (
              <span className="badge badge-info">Członek projektu</span>
            )}
          </div>
          
          {/* Pokaż przyciski edycji/usuwania tylko właścicielowi */}
          {projectOwner && (
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-4 h-4" />
                Edytuj
              </button>
              <button
                className="btn btn-error btn-outline btn-sm"
                onClick={handleDeleteProject}
              >
                <Trash2 className="w-4 h-4" />
                Usuń
              </button>
            </div>
          )}
        </div>

        {/* Project Info Card */}
        <div className="card bg-base-100 shadow-sm border mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Description */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-3">Opis projektu</h3>
                {project.description ? (
                  <p className="text-gray-600 leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    Brak opisu projektu
                  </p>
                )}
              </div>

              {/* Project Meta */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Członkowie zespołu</span>
                  </div>
                  {project.members && project.members.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {project.members.map((member, index) => (
                        <span
                          key={index}
                          className="badge badge-outline badge-sm"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Brak członków</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Data utworzenia</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(project.createdAt).toLocaleDateString("pl-PL", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {project.updatedAt && project.updatedAt !== project.createdAt && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Ostatnia aktualizacja</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(project.updatedAt).toLocaleDateString("pl-PL", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="card bg-base-100 shadow-sm border">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Zadania projektu</h3>
              <Link href={`/tasks`}>
                <button className="btn btn-primary btn-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj zadanie
                </button>
              </Link>
            </div>

            {tasksLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Brak zadań w tym projekcie</p>
                <Link href={`/tasks`}>
                  <button className="btn btn-primary btn-sm">
                    Dodaj pierwsze zadanie
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 10).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-base-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getTaskStatusIcon(task.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {task.priority && (
                        <span className={`badge badge-outline badge-sm ${
                          task.priority === 'high' ? 'badge-error' :
                          task.priority === 'medium' ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {task.priority === 'high' ? 'Wysoki' :
                           task.priority === 'medium' ? 'Średni' : 'Niski'}
                        </span>
                      )}
                      
                      <span className={`badge ${getTaskStatusBadge(task.status)}`}>
                        {getTaskStatusText(task.status)}
                      </span>
                      
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString("pl-PL")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {tasks.length > 10 && (
                  <div className="text-center pt-4">
                    <Link href={`/todos?projectId=${project._id}`}>
                      <button className="btn btn-outline btn-sm">
                        Zobacz wszystkie zadania ({tasks.length})
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal - tylko dla właściciela */}
        {showEditModal && projectOwner && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Edytuj Projekt</h3>

              <form onSubmit={handleUpdateProject}>
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Nazwa projektu *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={projectForm.name}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        name: e.target.value,
                      })
                    }
                    required
                    placeholder="Wprowadź nazwę projektu"
                  />
                </div>

                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Opis</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    rows="4"
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Opisz swój projekt"
                  />
                </div>

                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Członkowie zespołu</span>
                  </label>
                  <div className="join w-full">
                    <input
                      type="email"
                      className="input input-bordered join-item flex-1"
                      placeholder="Email członka zespołu"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <button
                      type="button"
                      className="btn btn-primary join-item"
                      onClick={addMember}
                      disabled={!memberInput.trim()}
                    >
                      Dodaj
                    </button>
                  </div>

                  {projectForm.members.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-600 mb-2">
                        Członkowie:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {projectForm.members.map((member, index) => (
                          <div
                            key={index}
                            className="badge badge-outline gap-2"
                          >
                            {member}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => removeMember(member)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowEditModal(false);
                      setProjectForm({
                        name: project.name,
                        description: project.description || "",
                        members: project.members || [],
                      });
                      setMemberInput("");
                    }}
                  >
                    Anuluj
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Zapisz zmiany
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}