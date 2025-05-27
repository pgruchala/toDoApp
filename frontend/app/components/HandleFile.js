import React from "react";
import Papa, { parse } from "papaparse";
import { parseStringPromise } from "xml2js";

export const processJSON = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return data
      .map((task) => ({
        title: task.title || "",
        description: task.description || "",
        comment: task.comment || "",
        priority: parseInt(task.priority || "1"),
        date: new Date().toLocaleString(),
      }))
      .filter((task) => task.title && task.description);
  } catch (error) {
    throw new Error("Error processing JSON file: " + error.message);
  }
};

export const processCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true, //zamienia pierwszą linijkę na tytuły
      skipEmptyLines: true,
      complete: (results) => {
        const newTasks = results.data
          .map((task) => ({
            title: task.title || "",
            description: task.description || "",
            comment: task.comment || "",
            priority: task.priority || "1",
            date: new Date().toLocaleString(),
          }))
          .filter((task) => task.title && task.description);
        resolve(newTasks);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const processXML = async (file) => {
  try {
    const data = await file.text();
    const result = await parseStringPromise(data, {
      mergeAttrs: true,
      explicitArray: false,
    });
    if (!result.tasks || !result.tasks.task) {
      throw new Error("Brak zadań w pliku");
    }

    const tasksArray = result.tasks.task;

    return tasksArray
      .map((task) => ({
        title: task.title || "",
        description: task.description || "",
        comment: task.comment || "",
        priority: parseInt(task.priority || "1"),
        date: new Date().toLocaleString(),
      }))
      .filter((task) => task.title && task.description);
  } catch (error) {
    throw new Error("Error processing XML file: " + error.message);
  }
};
