// App.jsx
import React, { useEffect, useState } from "react";
import SceneRenderer from "./CORE/render/sceneRenderer";
import LoginGate from "./CORE/auth/moodle-login/loginGate";
import { loadModuleManifest } from "./CORE/resources/loadModuleManifest";
import { loadCssDynamically } from "./CORE/resources/loadCssDynamically";
import { resolveInitialScene } from "./CORE/resources/sceneLogic";
import { getPath } from "./CORE/config-parser/getPath";

export default function App() {
  const [manifest, setManifest] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [initialScene, setInitialScene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const m = await loadModuleManifest(getPath('manifest.yaml'));
      setManifest(m);

      // Cargar CSS del manifest
      if (m.meta?.skin) {
        loadCssDynamically(getPath(m.meta.skin));
      }

      setLoading(false);
    };

    init();
  }, []);

  // Cuando la sesión está lista, resolvemos escena inicial
  useEffect(() => {
    if (!sessionReady || !manifest) return;

    const file = resolveInitialScene(manifest, assignments);
    setInitialScene(getPath(file));
  }, [sessionReady, manifest, assignments]);

  if (loading || !manifest) return <div>Cargando simulador…</div>;

  if (!sessionReady)
    return (
      <LoginGate
        requireLogin={manifest.meta.requireLogin}
        onReady={({ assignments }) => {
          setAssignments(assignments);
          setSessionReady(true);
        }}
      />
    );
  if (!initialScene) return <div>Cargando escena inicial…</div>;
  return <SceneRenderer initialScene={initialScene} />;
}
