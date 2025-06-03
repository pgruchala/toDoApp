const { Query } = require("mongoose");
const Task = require("../models/Task");
const xml2js = require("xml2js");
const { Parser } = require("json2csv").parse;

const sanitizeTaskData = (task, userId) => {
  return {
    title: task.title?.trim(),
    description: task.description?.trim(),
    status: task.status || "pending",
    priority: task.priority || "medium",
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    userId: userId,
    projectId: task.projectId?.trim() || null,
    assignedTo: task.assignedTo?.trim() || null,
  };
};

const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    throw new Error(
      "Plik CSV musi zawierać nagłówki i przynajmniej jeden wiersz danych"
    );
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const tasks = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const task = {};

    headers.forEach((header, index) => {
      if (values[index]) {
        task[header] = values[index];
      }
    });

    if (task.title) {
      tasks.push(task);
    }
  }

  return tasks;
};

exports.exportTasks = async (req, res, next) => {
  try {
    const { userId, email, role } = req.user;
    const { format = "json", projectId, status, priority } = req.query;

    let query = {};
    if (!role.includes("admin")) {
      query = { $or: [{ userId }, { assignedTo: email }] };
    }

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brak zadań do eksportu",
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let filename, content, contentType;

    switch (format.toLowerCase()) {
      case "json":
        filename = `tasks-export-${timestamp}.json`;
        content = JSON.stringify(
          {
            exportDate: new Date().toISOString(),
            totalTasks: tasks.length,
            tasks: tasks,
          },
          null,
          2
        );
        contentType = "application/json";
        break;

      case "csv":
        filename = `tasks-export-${timestamp}.csv`;
        const csvFields = [
          "title",
          "description",
          "status",
          "priority",
          "dueDate",
          "userId",
          "projectId",
          "assignedTo",
          "createdAt",
          "updatedAt",
        ];
        const parser = new Parser({ fields: csvFields });
        content = parser.parse(tasks);
        contentType = "text/csv";
        break;

      case "xml":
        filename = `tasks-export-${timestamp}.xml`;
        const builder = new xml2js.Builder({
          rootName: "taskExport",
          xmldec: { version: "1.0", encoding: "UTF-8" },
        });
        const xmlData = {
          exportDate: new Date().toISOString(),
          totalTasks: tasks.length,
          tasks: { task: tasks },
        };
        content = builder.buildObject(xmlData);
        contentType = "application/xml";
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Nieobsługiwany format. Dostępne formaty: json, csv, xml",
        });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(content);
  } catch (error) {
    console.error("Błąd podczas eksportu zadań:", error);
    next(error);
  }
};

exports.importTasks = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { overwrite = false, format } = req.query;

    let rawData = "";
    req.on("data", (chunk) => {
      rawData += chunk.toString();
    });

    req.on("end", async () => {
      try {
        if (!rawData.trim()) {
          return res.status(400).json({
            success: false,
            message: "Brak danych do importu",
          });
        }

        let tasks = [];
        const detectedFormat = format || detectFormat(rawData);

        switch (detectedFormat.toLowerCase()) {
          case "json":
            try {
              const jsonData = JSON.parse(rawData);
              tasks = Array.isArray(jsonData) ? jsonData : jsonData.tasks || [];
            } catch (parseError) {
              return res.status(400).json({
                success: false,
                message: "Nieprawidłowy format JSON",
              });
            }
            break;

          case "xml":
            try {
              const parser = new xml2js.Parser({ explicitArray: false });
              const xmlData = await parser.parseStringPromise(rawData);
              tasks =
                xmlData.taskExport?.tasks?.task || xmlData.tasks?.task || [];
              if (!Array.isArray(tasks)) tasks = [tasks];
            } catch (parseError) {
              return res.status(400).json({
                success: false,
                message: "Nieprawidłowy format XML",
              });
            }
            break;

          case "csv":
            try {
              tasks = parseCSV(rawData);
            } catch (parseError) {
              return res.status(400).json({
                success: false,
                message: `Błąd parsowania CSV: ${parseError.message}`,
              });
            }
            break;

          default:
            return res.status(400).json({
              success: false,
              message:
                "Nierozpoznany format danych. Użyj parametru ?format=json/csv/xml",
            });
        }

        if (!Array.isArray(tasks) || tasks.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Brak prawidłowych zadań do importu",
          });
        }

        const validTasks = [];
        const errors = [];

        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          const sanitizedTask = sanitizeTaskData(task, userId);
          validTasks.push(sanitizedTask);
        }

        let importedCount = 0;
        let updatedCount = 0;
        const importErrors = [];

        for (const taskData of validTasks) {
          try {
              const newTask = new Task(taskData);
              await newTask.save();
              importedCount++;
            
          } catch (error) {
            importErrors.push({
              title: taskData.title,
              error: error.message,
            });
          }
        }

        res.status(200).json({
          success: true,
          message: `Import zakończony. Utworzono ${importedCount} nowych zadań, zaktualizowano ${updatedCount} zadań`,
          summary: {
            totalProcessed: tasks.length,
            imported: importedCount,
            updated: updatedCount,
            validationErrors: errors.length,
            importErrors: importErrors.length,
            format: detectedFormat,
          },
          errors:
            errors.length > 0 || importErrors.length > 0
              ? {
                  validationErrors: errors,
                  importErrors: importErrors,
                }
              : undefined,
        });
      } catch (error) {
        console.error("Błąd podczas importu zadań:", error);
        res.status(500).json({
          success: false,
          message: `Błąd podczas importu: ${error.message}`,
        });
      }
    });
  } catch (error) {
    console.error("Błąd podczas inicjalizacji importu:", error);
    next(error);
  }
};

const detectFormat = (data) => {
  const trimmedData = data.trim();

  if (trimmedData.startsWith("{") || trimmedData.startsWith("[")) {
    return "json";
  }

  if (trimmedData.startsWith("<?xml") || trimmedData.startsWith("<")) {
    return "xml";
  }
  const lines = trimmedData.split("\n");
  if (lines.length >= 2 && lines[0].includes(",") && lines[1].includes(",")) {
    return "csv";
  }

  return "unknown";
};
