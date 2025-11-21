import React, { useState, useEffect } from "react";
import { onEvent } from "../../sceneRenderer/eventBus";

export default function FileUploadElement({
  action,
  onAction,
  className,
  background,
  icon,
  text,
  id,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [assignmentId, setAssignmentId] = useState("");

  const findAssignment = (name) => {
    const stored = sessionStorage.getItem("assignments");
    if (!stored) return null;
    try {
      const assignments = JSON.parse(stored);
      const found = assignments.find((a) => a.name && a.name.includes(name));
      return found;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const unsubSuccess = onEvent("success:upload_file", () => {
      // Deshabilita visualmente
      setIsDisabled(true);

      // Actualiza el assignment en sessionStorage
      const stored = sessionStorage.getItem("assignments");
      if (stored) {
        try {
          const assignments = JSON.parse(stored);
          const updated = assignments.map((a) =>
            a.name && a.name.includes(id)
              ? { ...a, submissionstatus: "submitted" }
              : a
          );
          sessionStorage.setItem("assignments", JSON.stringify(updated));
          //console.log(`Estado de ${id} actualizado a 'submitted'`);
        } catch (err) {
          console.error(
            "Error actualizando assignments en sessionStorage",
            err
          );
        }
      }
    });

    const unsubStart = onEvent("upload_file", () => setIsDisabled(false));

    const assignment = findAssignment(id);
    setAssignmentId(assignment ? assignment.id : null);
    if (assignment && assignment.submissionstatus === "submitted") {
      setIsDisabled(true);
      onAction(`show:boton_${id}`);
    } else {
      onAction(`hide:boton_${id}`);
    }

    return () => {
      unsubSuccess();
      unsubStart();
    };
  }, []);

  const handleUpload = async (file) => {
    if (!file || !onAction || isDisabled) return;
    setIsLoading(true);

    try {
      await onAction({
        type: action,
        __file: file,
        assignmentId,
        id,
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

  return (
    <div
      className={`relative ${
        className || "border-2 border-dashed border-gray-400"
      } ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } bg-contain bg-center bg-no-repeat`}
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
