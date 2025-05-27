"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Calendar, FolderOpen } from "lucide-react";
import apiClient from "../clients/apiClient";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [memberInput, setMemberInput] = useState("");
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/projects");
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...projectForm,
        members: projectForm.members.filter((member) => member.trim() !== ""),
      };

      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject._id}`, projectData);
      } else {
        await apiClient.post("/projects", projectData);
      }

      setShowProjectModal(false);
      setEditingProject(null);
      resetProjectForm();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };
  const handleDeleteProject = async (projectId) => {
    if (
      confirm(
        "Czy na pewno chcesz usunąć ten projekt? Wszystkie powiązane zadania pozostaną bez projektu."
      )
    ) {
      try {
        await apiClient.delete(`/projects/${projectId}`);
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };
  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description || "",
      members: project.members || [],
    });
    setShowProjectModal(true);
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: "",
      description: "",
      members: [],
    });
    setMemberInput("");
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetProjectForm();
              setEditingProject(null);
              setShowProjectModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowy Projekt
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              Brak projektów
            </h3>
            <p className="text-gray-400 mb-4">
              Stwórz swój pierwszy projekt, aby lepiej organizować zadania
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="card bg-base-100 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="card-body">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="card-title text-lg">{project.name}</h3>
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-sm"
                      >
                        ⋮
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-32"
                      >
                        <li>
                          <button onClick={() => handleEditProject(project)}>
                            <Edit className="w-4 h-4" />
                            Edytuj
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="text-error hover:bg-error hover:text-error-content"
                          >
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {project.members?.length || 0} członków
                    </span>
                  </div>

                  {project.members && project.members.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.members.slice(0, 3).map((member, index) => (
                          <span
                            key={index}
                            className="badge badge-outline badge-sm"
                          >
                            {member}
                          </span>
                        ))}
                        {project.members.length > 3 && (
                          <span className="badge badge-ghost badge-sm">
                            +{project.members.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar className="w-3 h-3" />
                    Utworzono:{" "}
                    {new Date(project.createdAt).toLocaleDateString("pl-PL")}
                  </div>

                  <div className="card-actions justify-end">
                    <Link href={`/projects/${project._id}`}>
                      <button className="btn btn-primary btn-sm">
                        Zobacz zadania
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ POPRAWKA: Modal przeniesiony POZA pętlę map() */}
        {showProjectModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                {editingProject ? "Edytuj Projekt" : "Nowy Projekt"}
              </h3>

              <form onSubmit={handleSubmitProject}>
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
                    rows="3"
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
                      setShowProjectModal(false);
                      setEditingProject(null);
                      resetProjectForm();
                    }}
                  >
                    Anuluj
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? "Zapisz zmiany" : "Stwórz projekt"}
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
