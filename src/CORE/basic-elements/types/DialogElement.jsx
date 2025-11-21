import React from "react";
import MotionWrapper from "../MotionWrapper";

export default function DialogElement({
  title,
  text,
  button,
  onAction,
  className,
  flip = false,
  skin = {}
}) {
  const dialogSkin = skin.dialog || {};
  const background = dialogSkin.background || {};

  const isImage = background.type === "image";
  const bgImage = flip && background.srcFlip ? background.srcFlip : background.src;

  const style = {
    padding: dialogSkin.padding || "20px",
    borderRadius: dialogSkin.borderRadius || "20px",
    boxShadow: dialogSkin.shadow || "none",
    color: dialogSkin.textColor || "inherit",
    fontFamily: dialogSkin.fontFamily || "inherit",
    backgroundColor: background.type === "color" ? background.value : undefined,
    backgroundImage: isImage && bgImage ? `url(${bgImage})` : undefined,
    backgroundSize: isImage ? "100% 100%" : undefined,
    backgroundRepeat: "no-repeat"
  };

  return (
    <div
      className={`dialog-container fade-in-bottom ${className || ""} ${
        flip ? "dialog-flipped" : ""
      }`}
      style={style}
    >
      <h1 style={{ color: dialogSkin.titleColor || "inherit" }}>{title}</h1>

      <p style={{ whiteSpace: "pre-line" }}>{text}</p>

      {button && (
        <div className="video" onClick={() => onAction?.(button.action)}>
          <span>{button.label}</span>
          <MotionWrapper animate={button.animate} delay={button.delay}>
            <img
              src={button.icon}
              alt="Ícono de video"
              className="icon clickable"
            />
          </MotionWrapper>
        </div>
      )}
    </div>
  );
}
