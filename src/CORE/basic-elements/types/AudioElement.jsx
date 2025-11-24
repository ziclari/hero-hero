import React, { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Icon } from "@iconify/react";
import { getPath } from "../../config-parser/getPath";
import Button from "./AriaButton";

export default function AudioElement({
  src,
  autoplay,
  className,
  action,
  onAction,
  waveColor = "rgba(0, 107, 255, 0.3)",
  progressColor = "rgba(0, 179, 255, 0.9)",
  cursorColor = "#00b3ff",
  height = 150,
  barWidth = 3
}) {
  const containerRef = useRef(null);
  const waveSurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    waveSurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor,
      height,
      barWidth,
      responsive: true,
      normalize: true,
    });

    const soundsrc = src.includes("http") ? src : getPath(src);
    waveSurferRef.current.load(soundsrc);

    if (autoplay) {
      waveSurferRef.current.on("ready", () => {
        waveSurferRef.current.play();
        setIsPlaying(true);
      });
    }

    waveSurferRef.current.on("finish", () => {
      setIsPlaying(false);

      if (action && onAction) {
        onAction({ type: action });
      }

      onAction?.({ type: "audio_finished" });
    });

    return () => waveSurferRef.current?.destroy();
  }, [src]);

  const togglePlay = () => {
    waveSurferRef.current.playPause();
    setIsPlaying(waveSurferRef.current.isPlaying());
    console.log("hola")
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        onPress={togglePlay}
        variant="audio"  
      >
        <Icon
          icon={isPlaying ? "mdi:pause" : "mdi:play"}
          width="28"
          height="28"
        />
      </Button>

      <div
        ref={containerRef}
        className="flex-1 rounded-lg overflow-hidden bg-transparent"
      />
    </div>
  );
}
