"use client";
import React, { useState } from "react";

import { processJSON, processCSV, processXML } from "./HandleFile";

function FileModal({
  fileModalOpen,
  setModalOpen,
  addMultipleTasks ,
}) {
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      let newTasks = [];
      const typ = file.type;
      if (typ === "text/csv") {
        newTasks = await processCSV(file);
      } else if (typ === "application/json") {
        newTasks = await processJSON(file);
      } else if (typ === "text/xml" || typ === "application/xml") {
        newTasks = await processXML(file);
      } else {
        console.error("Unsupported file type:", typ);
        alert(
          "Nieobsługiwany typ pliku. Proszę wybrać plik JSON, CSV lub XML."
        );
        return;
      }

      addMultipleTasks(newTasks);
      setModalOpen(false);
    } catch (error) {
      console.log("Error occurred: " + error.message);
      alert(`Wystąpił błąd podczas przetwarzania pliku: ${error.message}`);
    }
  }

  return (
    <dialog
      id="my_modal"
      className={`modal ${fileModalOpen ? "modal-open" : ""}`}
    >
      <div className="modal-box text-center">
        <input
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          onChange={handleFileUpload}
          accept=".json,.csv,.xml"
        />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setModalOpen(false)}>Zamknij</button>
      </form>
    </dialog>
  );
}

export default function FileInput({ addMultipleTasks  }) {
  const [fileModalOpen, setModalOpen] = useState(false);

  return (
    <div className="m-1">
      {" "}
      {}
      <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>
        Importuj zadania
      </button>
      <FileModal
        fileModalOpen={fileModalOpen}
        setModalOpen={setModalOpen}
        addMultipleTasks={addMultipleTasks}
      />
    </div>
  );
}
