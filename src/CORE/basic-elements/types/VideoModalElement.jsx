// VideoModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { getPath } from "../../config-parser/getPath";
import { stateManager } from "../../managers/stateManager";
import { UIController } from "../../render/UIController";

export default function VideoModal({ videoData, skinName = "default" }) {
  if (!videoData) return null;

  const videoId = videoData.id;
  const isDriveVideo = videoData.src.includes("drive.google.com");


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
