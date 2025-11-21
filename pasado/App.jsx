import SceneRenderer from "./components/sceneRenderer/sceneRenderer";
import React, { useEffect, useState } from "react";
import * as yaml from "js-yaml";
import Login from "./login/login";
import { moodleApi } from "./services/moodleApi";
import { getAssignments, refreshSession } from "./services/moodleService";
import axios from "axios";

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [manifest, setManifest] = useState(null);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState(null);
  const [initialScene, setInitialScene] = useState(null);

  // ---------------------------------------------------
  // 1. Obtener la ruta base del simulador desde la URL
  // ---------------------------------------------------
  const getSimulatorBasePath = () => {
    const path = window.location.pathname;
    const simuladorIndex = path.indexOf("/simulador/");

    if (simuladorIndex === -1) {
      return "";
    }

    // Extrae desde /simulador/ en adelante (ej: /simulador/electro)
    const simulatorPath = path.substring(simuladorIndex);
    return simulatorPath;
  };

  // ---------------------------------------------------
  // 2. Cargar manifest desde la ruta correcta
  // ---------------------------------------------------
  const loadManifest = async () => {
    const basePath = getSimulatorBasePath();
    const manifestUrl = `${basePath}/manifest.yaml`;

    try {
      const res = await axios.get(manifestUrl, {
        responseType: "text",
        headers: { Accept: "text/yaml, text/plain, */*" },
      });

      // Detecta si devolvió HTML (error silencioso típico de SPA)
      if (
        typeof res.data === "string" &&
        res.data.trim().startsWith("<!DOCTYPE")
      ) {
        throw new Error(
          `Servidor devolvió HTML en lugar de manifest.yaml: ${manifestUrl}`
        );
      }

      return yaml.load(res.data);
    } catch (err) {
      throw new Error(`No se pudo cargar manifest desde ${manifestUrl}`);
    }
  };

  // ---------------------------------------------------
  // 3. Cargar parámetros desde URL
  // ---------------------------------------------------
  const getParams = async () => {
    const params = new URLSearchParams(location.search);
    const prefix = params.get("prefix");
    const courseId = params.get("course_id");
    const user = params.get("user");

    if (prefix) sessionStorage.setItem("prefix", prefix);
    if (courseId) sessionStorage.setItem("courseId", courseId);
    if (user) sessionStorage.setItem("userId", user);
  };

  // ---------------------------------------------------
  // 4. Evaluar condiciones skipIf
  // ---------------------------------------------------
  async function evaluateSkip(skipIf, assignments) {
    if (!skipIf || skipIf.length === 0) return false;

    return skipIf.some((condition) => {
      if (condition === "user_has_any_phase_progress") {
        return assignments && assignments.length > 0;
      }
      return false;
    });
  }

  // ---------------------------------------------------
  // 5. Resolver escena inicial basada en skipIf
  // ---------------------------------------------------
  async function resolveInitialScene(manifest, assignments) {
    const startSceneId = manifest.meta.startScene;
    const scene = manifest.scenes.find((s) => s.id === startSceneId);

    if (!scene) {
      throw new Error(`startScene "${startSceneId}" no encontrado en manifest`);
    }

    // Evaluar si debe saltarse esta escena
    const shouldSkip = await evaluateSkip(scene.skipIf, assignments);

    if (shouldSkip && scene.next) {
      // Si hay skip y tiene "next", buscar la siguiente escena
      const nextScene = manifest.scenes.find((s) => s.id === scene.next);
      if (!nextScene) {
        throw new Error(`Escena next "${scene.next}" no encontrada`);
      }
      return {
        id: nextScene.id,
        file: nextScene.file,
      };
    }

    // Si no hay skip, usar la escena inicial
    return {
      id: scene.id,
      file: scene.file,
    };
  }

  // ---------------------------------------------------
  // 6. Validar sesión y cargar escena inicial
  // ---------------------------------------------------
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Cargar manifest
        const m = await loadManifest();
        setManifest(m);
        // Cargar parámetros de URL
        await getParams();

        // Si no requiere login, marcar como válido
        if (!m.meta.requireLogin) {
          setValid(true);

          // Resolver escena inicial sin assignments
          const scene = await resolveInitialScene(m, []);
          setInitialScene(scene);
          setLoading(false);
          return;
        }

        // Esperar a que los parámetros estén en sessionStorage
        const waitForParams = () =>
          new Promise((resolve) => {
            const check = () => {
              const prefix = sessionStorage.getItem("prefix");
              const courseId = sessionStorage.getItem("courseId");
              if (prefix && courseId) resolve(true);
              else setTimeout(check, 100);
            };
            check();
          });

        await waitForParams();

        // Refrescar sesión si existe refreshToken
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (refreshToken) await refreshSession();

        // Verificar sesión con el backend
        const { data } = await moodleApi.get("/auth/check");

        if (data.ok) {
          setValid(true);

          // Obtener assignments del usuario
          const assignments = await getAssignments();

          // Resolver escena inicial según skipIf
          const scene = await resolveInitialScene(m, assignments);
          console.log(scene);
          setInitialScene(scene);
        } else {
          setValid(false);
        }
      } catch (err) {
        console.error("Error verificando sesión:", err);
        setValid(false);
        setError(err.message || "Sesión no válida");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Pantalla de carga
  if (loading || !manifest || (!error && !initialScene?.file)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        {error ? `Error: ${error}` : "Verificando sesión..."}
      </div>
    );
  }

  return (
    <>
      {!valid ? (
        <Login setValid={setValid} />
      ) : (
        <SceneRenderer initialScene={initialScene.file} />
      )}
    </>
  );
}

const App = () => <AppContent />;

export default App;
