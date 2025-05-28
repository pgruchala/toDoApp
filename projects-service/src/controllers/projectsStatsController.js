const Project = require("../models/Project");

exports.getProjectStats = async (req, res, next) => {
  try {
    const { role } = req.user;

    if (!role.includes("admin")) {
      return res.status(403).json({
        success: false,
        message: "Access denied - admin privileges required",
      });
    }

    const [
      totalProjects,
      projectsThisMonth,
      projectsThisWeek,
      projectsByMemberCount,
      avgMembersPerProject,
    ] = await Promise.all([
      Project.countDocuments({}),

      Project.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),

      Project.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),

      Project.aggregate([
        {
          $project: {
            memberCount: { $size: { $ifNull: ["$members", []] } },
          },
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $eq: ["$memberCount", 0] }, then: "0" },
                  { case: { $lte: ["$memberCount", 2] }, then: "1-2" },
                  { case: { $lte: ["$memberCount", 5] }, then: "3-5" },
                  { case: { $lte: ["$memberCount", 10] }, then: "6-10" },
                ],
                default: "10+",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      Project.aggregate([
        {
          $project: {
            memberCount: { $size: { $ifNull: ["$members", []] } },
          },
        },
        {
          $group: {
            _id: null,
            avgMembers: { $avg: "$memberCount" },
          },
        },
      ]),
    ]);

    const memberDistribution = projectsByMemberCount.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const topProjectOwners = await Project.aggregate([
      {
        $group: {
          _id: "$userId",
          projectCount: { $sum: 1 },
        },
      },
      { $sort: { projectCount: -1 } },
      { $limit: 10 },
    ]);

    const mostActiveProjects = await Project.find({})
      .select("name members userId")
      .sort({ "members.length": -1 })
      .limit(10)
      .lean();

    const stats = {
      totalProjects,
      recentActivity: {
        projectsThisMonth,
        projectsThisWeek,
      },
      memberDistribution: {
        0: memberDistribution["0"] || 0,
        "1-2": memberDistribution["1-2"] || 0,
        "3-5": memberDistribution["3-5"] || 0,
        "6-10": memberDistribution["6-10"] || 0,
        "10+": memberDistribution["10+"] || 0,
      },
      avgMembersPerProject:
        avgMembersPerProject.length > 0
          ? parseFloat(avgMembersPerProject[0].avgMembers.toFixed(2))
          : 0,
      topProjectOwners,
      mostActiveProjects: mostActiveProjects.map((project) => ({
        id: project._id,
        name: project.name,
        memberCount: project.members ? project.members.length : 0,
        owner: project.userId,
      })),
    };

    res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching project stats:", error);
    next(error);
  }
};
