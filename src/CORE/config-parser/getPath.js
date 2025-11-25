export const getSimulatorBasePath = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/simulador\/([^\/]+)/);
  if (!match) return "";

  return `/simulador/${match[1]}`;
};

export const getPath = (currentFile) => {
  const basePath = getSimulatorBasePath();
  return new URL(currentFile, window.location.origin + basePath + "/").href;
};

export const getStorageKey = () => {
  const basePath = getSimulatorBasePath(); // /simulador/ABC123
  if (!basePath) return "simulator_state_default";

  const parts = basePath.split("/");
  const id = parts[2]; // simulador/<ID>
  return `simulator_state_${id}`;
};