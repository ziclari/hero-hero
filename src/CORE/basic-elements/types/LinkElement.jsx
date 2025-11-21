// src/components/types/LinkElement.js
import React from "react";

export default function LinkElement({
  href,
  text,
  className,
  skin,
  action,
  onAction,
}) {
  const s = skin || {};
  const Wrapper = s.wrapper === "button" ? "button" : "a";

  const wrapperProps = s.wrapperProps || {};
  const finalClass = `${className || ""} ${s.className || ""}`.trim();

  const isAction = Boolean(action);

  const handleClick = (e) => {
    if (isAction) {
      e.preventDefault();
      onAction?.(action);
    }
  };

  return (
    <Wrapper
      {...wrapperProps}
      href={Wrapper === "a" && !isAction ? href : undefined}
      onClick={isAction ? handleClick : undefined}
      className={finalClass}
      target={Wrapper === "a" && !isAction ? "_blank" : undefined}
      rel={Wrapper === "a" && !isAction ? "noopener noreferrer" : undefined}
    >
      {s.beforeText || ""}
      {text}
      {s.afterText || ""}
    </Wrapper>
  );
}
