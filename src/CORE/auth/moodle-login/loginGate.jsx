// CORE/auth/LoginGate.jsx
import React, { useEffect, useState } from "react";
import Login from "./login";
import { getAssignments, refreshSession } from "../../external-services/moodle-service/moodleService";
import { moodleApi } from "../../external-services/moodle-service/moodleApi";

export default function LoginGate({ requireLogin, onReady }) {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const verify = async () => {
      if (!requireLogin) {
        onReady({ assignments: [] });
        setLoading(false);
        return;
      }

      try {
        // Intenta refrescar sesión
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (refreshToken) await refreshSession();

        // Verifica sesión con backend
        const { data } = await moodleApi.get("/auth/check");

        if (data.ok) {
          setValid(true);

          // Obtener assignments
          const a = await getAssignments();
          setAssignments(a);

          onReady({ assignments: a });
        } else {
          setValid(false);
        }
      } catch {
        setValid(false);
      }

      setLoading(false);
    };

    verify();
  }, [requireLogin]);

  if (loading) return <div>Cargando sesión...</div>;

  if (!valid) {
    return (
      <Login
        onSuccess={async () => {
          const a = await getAssignments();
          setAssignments(a);
          onReady({ assignments: a });
          setValid(true);
        }}
      />
    );
  }

  return null;
}
