"use client";
import React from "react";
export default function ExportTasks({ tasks }) {
  const exportToFile = (format) => {
    let fileContent = "";
    let fileName = "";
    let mimeType = "";
    if (!tasks || tasks.length === 0) {
      alert("Brak zadań do wyeksportowania.");
      return;
    }

    if (format === "csv") {
      fileContent = "title,description,comment,priority,date\n";
      fileContent += tasks
        .map(
          (task) =>
            `"${task.title || ""}","${task.description || ""}","${
              task.comment || ""
            }","${task.priority || ""}","${task.date || ""}"`
        )
        .join("\n");
      fileName = "tasks.csv";
      mimeType = "text/csv";
    } else if (format === "json") {
      fileContent = JSON.stringify(tasks, null, 2);
      fileName = "tasks.json";
      mimeType = "application/json";
    } else if (format === "xml") {
      fileContent = `<?xml version="1.0" encoding="UTF-8"?>\n<tasks>\n`;
      fileContent += tasks
        .map(
          (task) => `  <task>
    <title>${String(task.title || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")}</title>
    <description>${String(task.description || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")}</description>
    <comment>${String(task.comment || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")}</comment>
    <priority>${String(task.priority || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")}</priority>
    <date>${String(task.date || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")}</date>
  </task>`
        )
        .join("\n");
      fileContent += `\n</tasks>`;
      fileName = "tasks.xml";
      mimeType = "application/xml";
    }

    const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(
      fileContent
    )}`;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div>
      {" "}
      {}
      <details className="dropdown">
        <summary className="btn m-1">Eksportuj zadania</summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li>
            <button onClick={() => exportToFile("json")}>JSON</button>
          </li>
          <li>
            <button onClick={() => exportToFile("xml")}>XML</button> {}
          </li>
          <li>
            <button onClick={() => exportToFile("csv")}>CSV</button>
          </li>
        </ul>
      </details>
    </div>
  );
}
