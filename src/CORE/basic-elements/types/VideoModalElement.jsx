// VideoModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { getPath } from "./sceneRenderer/getPath";
import { SkinManager } from "../skinManager";
import defaultSkin from "../skins/videoModal.default.json";
import { stateManager } from "../managers/stateManager";
import { UIController } from "../managers/UIController";

export default function VideoModal({ videoData, skinName = "default" }) {
  if (!videoData) return null;

  const videoId = videoData.id;
  const isDriveVideo = videoData.src.includes("drive.google.com");

  // busca en módulos externos
  const externalSkin = SkinManager.get("videoModal", skinName);

  // mezcla entre default y external
  const skin = {
    ...defaultSkin.default,
    ...(externalSkin || {})
  };

  const { overlay, container, video, iframe, closeButton } = skin;

  const onClose = () => {
    UIController.execute(`emit:end:${videoId}`);
    stateManager.set("videoId", null);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className={container}>
          {isDriveVideo ? (
            <iframe src={videoData.src} allow="autoplay" className={iframe}></iframe>
          ) : (
            <video src={getPath(videoData.src)} controls autoPlay className={video} />
          )}

          <button onClick={onClose} className={closeButton}>✕</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
