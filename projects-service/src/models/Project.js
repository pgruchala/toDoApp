const mongoose = require("mongoose");

const Project = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [1, "Project name cannot be less than 1 character"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [1, "Project description cannot be less than 1 character"],
      maxlength: [500, "description cannot exceed 500 characters"],
    },
    userId: {
      type: String,
      required: [true, "User id is required"],
      trim: true,
      index: true,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    members: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", Project);
