const axios = require("axios");
require("dotenv").config();

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;
const TASKS_SERVICE_URL = process.env.TASKS_SERVICE_URL;
const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL;

exports.getServiceStats = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    
    const isAdmin = userInfo.realm_access?.roles?.includes("admin");
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied - admin privileges required"
      });
    }

    const [usersResponse, tasksResponse, projectsResponse] = await Promise.allSettled([
      axios.get(`${USERS_SERVICE_URL}/api/users/stats`, {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": "admin",
        },
      }),
      axios.get(`${TASKS_SERVICE_URL}/api/tasks/stats`, {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": "admin",
        },
      }),
      axios.get(`${PROJECT_SERVICE_URL}/api/projects/stats`, {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": "admin",
        },
      })
    ]);

    const stats = {
      users: {
        available: usersResponse.status === 'fulfilled',
        data: usersResponse.status === 'fulfilled' ? usersResponse.value.data : null,
        error: usersResponse.status === 'rejected' ? usersResponse.reason.message : null
      },
      tasks: {
        available: tasksResponse.status === 'fulfilled',
        data: tasksResponse.status === 'fulfilled' ? tasksResponse.value.data : null,
        error: tasksResponse.status === 'rejected' ? tasksResponse.reason.message : null
      },
      projects: {
        available: projectsResponse.status === 'fulfilled',
        data: projectsResponse.status === 'fulfilled' ? projectsResponse.value.data : null,
        error: projectsResponse.status === 'rejected' ? projectsResponse.reason.message : null
      }
    };

    const summary = {
      totalUsers: stats.users.available ? stats.users.data.totalUsers : 0,
      totalTasks: stats.tasks.available ? stats.tasks.data.totalTasks : 0,
      totalProjects: stats.projects.available ? stats.projects.data.totalProjects : 0,
      servicesStatus: {
        usersService: stats.users.available ? 'online' : 'offline',
        tasksService: stats.tasks.available ? 'online' : 'offline',
        projectsService: stats.projects.available ? 'online' : 'offline'
      }
    };

    res.status(200).json({
      success: true,
      summary,
      detailed: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching service stats:", error);
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const userInfo = req.kauth.grant.access_token.content;
    
    const [tasksResponse, projectsResponse] = await Promise.allSettled([
      axios.get(`${TASKS_SERVICE_URL}/api/tasks?userId=${userInfo.sub}`, {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": userInfo.realm_access?.roles?.includes("admin") ? "admin" : "user",
        },
      }),
      axios.get(`${PROJECT_SERVICE_URL}/api/projects`, {
        headers: {
          "x-user-id": userInfo.sub,
          "x-user-email": userInfo.email,
          "x-user-role": userInfo.realm_access?.roles?.includes("admin") ? "admin" : "user",
        },
      })
    ]);

    let userStats = {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      totalProjects: 0,
      tasksByPriority: {
        low: 0,
        medium: 0,
        high: 0
      }
    };

    if (tasksResponse.status === 'fulfilled') {
      const tasks = tasksResponse.value.data.tasks || tasksResponse.value.data || [];
      userStats.totalTasks = tasks.length;
      userStats.completedTasks = tasks.filter(task => task.status === 'completed').length;
      userStats.pendingTasks = tasks.filter(task => task.status === 'pending').length;
      userStats.inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      
      tasks.forEach(task => {
        if (userStats.tasksByPriority.hasOwnProperty(task.priority)) {
          userStats.tasksByPriority[task.priority]++;
        }
      });
    }

    if (projectsResponse.status === 'fulfilled') {
      const projects = projectsResponse.value.data.projects || projectsResponse.value.data || [];
      userStats.totalProjects = projects.length;
    }

    res.status(200).json({
      success: true,
      userStats,
      userId: userInfo.sub,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    next(error);
  }
};