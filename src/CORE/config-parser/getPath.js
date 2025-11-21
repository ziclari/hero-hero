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
