import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import { getPath } from "../../sceneRenderer/getPath";
export default function CardElement({
  id,
  img,
  title,
  content,
  action,
  requires = [],
  onAction,
  className,
}) {
  // Recupera el estado de assignments del sessionStorage
  const assignments = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("assignments") || "[]");
    } catch {
      return [];
    }
  }, []);

  // Verifica si una tarea o fase está marcada como completada
  const isCompleted = (key) => {
    const found = assignments.find((a) => a.name === key);
    return found?.submissionstatus === "submitted";
  };

  // Desbloqueo dinámico: todos los requeridos deben estar completos
  const unlocked = requires.every((r) => isCompleted(r));

  const handleClick = () => {
    if (unlocked && onAction) onAction(action);
  };

  return (
    <div
      className={`card ${className || ""} ${
        unlocked ? "cursor-pointer clickable" : "opacity-50 cursor-not-allowed"
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={getPath(img)}
          alt={title}
          className={`card__image fade-in-left ${unlocked ? "" : "grayscale"}`}
        />

        {unlocked ? (
          <span className="button icon color card__image-button">
            <Icon icon="mdi:plus-circle-outline" width={48} height={48} />{" "}
          </span>
        ) : (
          <>
            <span className="button icon color card__image-button">
              <Icon icon="mdi:plus-circle-outline" width={48} height={48} />{" "}
            </span>
            <span className="card__image-lock">
              <Icon icon="mdi:lock" width={32} height={32} />{" "}
            </span>
          </>
        )}
      </div>

      <p className="mt-2 text-white text-lg text-center">
        <strong>{title}</strong> {content}
      </p>
    </div>
  );
}
