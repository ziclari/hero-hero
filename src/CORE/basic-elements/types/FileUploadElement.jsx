import React, { useState, useEffect } from "react";
import { onEvent } from "../../events/eventBus";
import { getPath } from "../../config-parser/getPath";
import { stateManager } from "../../managers/stateManager";

export default function FileUploadElement({
  action,      // "upload_file"
  onAction,    // UIController
  className,
  background,
  icon,
  text,
  id,
}) {

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // --------------------------
  // Buscar assignment según el JSON recibido de Moodle
  // --------------------------
  const findAssignment = (needle) => {
    const list = stateManager.get("assignments"); // array de Moodle

    if (!Array.isArray(list)) return null;

    try {
      // Coincidencia exacta
      let found = list.find((a) => a.name === needle);
      if (found) return found;

      // Coincidencia parcial
      found = list.find((a) => a.name && a.name.includes(needle));
      return found || null;
    } catch {
      return null;
    }
  };

  // --------------------------
  // Sincroniza UI con el estado
  // --------------------------
  const syncFromStateManager = () => {
    const assignment = findAssignment(id);

    if (!assignment) {
      setIsDisabled(false);
      return false;
    }

    if (assignment.submissionstatus === "submitted") {
      setIsDisabled(true);
      return true;
    }

    setIsDisabled(false);
    return false;
  };

  useEffect(() => {
    // Valida estado inicial
    syncFromStateManager();

    const unsubSuccess = onEvent(`success:upload_file_${id}`, () => {
      setIsDisabled(true);
      setIsLoading(false);
    });

    const unsubStart = onEvent(`upload_file_${id}`, () => {
      setIsLoading(true);
      setIsDisabled(false);
    });

    const unsubError = onEvent(`error:upload_file_${id}`, () => {
      setIsLoading(false);
    });

    return () => {
      unsubSuccess();
      unsubStart();
      unsubError();
    };
  }, []);

  // --------------------------
  // Upload Handler
  // --------------------------
  const handleUpload = async (file) => {
    if (!file || isDisabled) return;

    setIsLoading(true);

    const assignment = findAssignment(id); // obtiene el assignment real de Moodle

    try {
      await onAction({
        type: action,
        id,                   // id textual del YAML
        assignmentId: assignment?.id, // id real de Moodle
        __file: file,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleUpload(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleDragOver = (event) => event.preventDefault();

  // --------------------------
  // UI
  // --------------------------
  return (
    <div
      className={`relative ${
        className || "border-2 border-dashed border-gray-400"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} bg-contain bg-center bg-no-repeat`}
      style={{
        backgroundImage: background ? `url(${getPath(background)})` : "",
      }}
      onDrop={!isDisabled ? handleDrop : undefined}
      onDragOver={!isDisabled ? handleDragOver : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-lg">
          Subiendo...
        </div>
      )}

      <label
        className={`cursor-pointer flex flex-col items-center space-y-2 ${
          isDisabled ? "pointer-events-none" : ""
        }`}
      >
        {icon ? (
          <img src={getPath(icon)} alt="" width={80} height={80} />
        ) : (
          <br />
        )}

        <span className={icon ? "p-4" : "mt-16 p-4"}>{text}</span>

        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isDisabled}
        />
      </label>
    </div>
  );
}
