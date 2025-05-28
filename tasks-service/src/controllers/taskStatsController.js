const Task = require("../models/Task");

exports.getTaskStats = async (req, res, next) => {
  try {
    const { role } = req.user;
    
    if (!role.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: "Access denied - admin privileges required"
      });
    }

    const [
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      tasksThisMonth,
      tasksThisWeek,
      overdueTasks
    ] = await Promise.all([
      Task.countDocuments({}),
      
      Task.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      Task.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 }
          }
        }
      ]),
      
      Task.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      
      Task.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }),
      
      Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $ne: "completed" }
      })
    ]);

    const statusStats = tasksByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const priorityStats = tasksByPriority.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const topUsers = await Task.aggregate([
      {
        $group: {
          _id: "$userId",
          taskCount: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { taskCount: -1 } },
      { $limit: 10 }
    ]);

    const stats = {
      totalTasks,
      tasksByStatus: {
        pending: statusStats.pending || 0,
        'in-progress': statusStats['in-progress'] || 0,
        completed: statusStats.completed || 0
      },
      tasksByPriority: {
        low: priorityStats.low || 0,
        medium: priorityStats.medium || 0,
        high: priorityStats.high || 0
      },
      recentActivity: {
        tasksThisMonth,
        tasksThisWeek,
        overdueTasks
      },
      topUsers,
      completionRate: totalTasks > 0 ? ((statusStats.completed || 0) / totalTasks * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching task stats:", error);
    next(error);
  }
};