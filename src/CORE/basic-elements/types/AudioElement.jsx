import React, { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Icon } from "@iconify/react";
import { getPath } from "../../sceneRenderer/getPath";
export default function AudioElement({
  src,
  autoplay,
  className,
  action, // <- nuevo, por si defines action en YAML
  onAction, // <- callback global de acciones
}) {
  const containerRef = useRef(null);
  const waveSurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    waveSurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(0, 107, 255, 0.3)",
      progressColor: "rgba(0, 179, 255, 0.9)",
      cursorColor: "#00b3ff",
      height: 150,
      barWidth: 3,
      responsive: true,
      normalize: true,
    });
    const soundsrc = src.includes("http") ? src : getPath(src);
    waveSurferRef.current.load(soundsrc);

    // Autoplay
    if (autoplay) {
      waveSurferRef.current.on("ready", () => {
        waveSurferRef.current.play();
        setIsPlaying(true);
      });
    }

    // Evento al terminar
    waveSurferRef.current.on("finish", () => {
      setIsPlaying(false);
      if (onAction && action) onAction({ type: action }); // dispara acción YAML
      // o emitir evento genérico si lo prefieres:
      onAction?.({ type: "audio_finished" });
    });

    return () => waveSurferRef.current?.destroy();
  }, [src]);

  const togglePlay = () => {
    waveSurferRef.current.playPause();
    setIsPlaying(waveSurferRef.current.isPlaying());
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        onClick={togglePlay}
        className="flex cursor-pointer items-center justify-center w-16 h-16 bg-white text-[#07254e] rounded-full hover:bg-white/60 transition-colors duration-200 shadow-lg"
      >
        <Icon
          icon={isPlaying ? "mdi:pause" : "mdi:play"}
          width="28"
          height="28"
        />
      </button>

      <div
        ref={containerRef}
        className="flex-1 rounded-lg overflow-hidden bg-transparent"
      />
    </div>
  );
}
