// src/components/types/ImageElement.js
import React from "react";
import { getPath } from "../../config-parser/getPath";

export default function ImageElement({
  src,
  action,
  onAction,
  className,
  skin
}) {
  const s = skin || {};

  // Wrapper definido por string en JSON
  // Puede ser "div", "button", "none"
  let Wrapper = "div";
  if (s.wrapper === "button") Wrapper = "button";
  if (s.wrapper === "none") Wrapper = React.Fragment;

  const wrapperProps = s.wrapperProps || {};

  const finalClass = `${className || ""} ${s.className || ""}`.trim();

  const imgProps = {
    src: getPath(src),
    className: `${s.imgClassName || ""}`.trim(),
    ...s.imgProps
  };

  const handleClick = () => {
    if (action) onAction?.(action);
  };

  // Cuando wrapper = Fragment, solo se devuelve la imagen
  if (Wrapper === React.Fragment) {
    return (
      <img {...imgProps} className={finalClass} />
    );
  }

  return (
    <Wrapper
      {...wrapperProps}
      onClick={action ? handleClick : undefined}
      className={Wrapper !== "button" ? finalClass : `${finalClass} cursor-pointer`}
    >
      {s.beforeImage || ""}
      <img {...imgProps} />
      {s.afterImage || ""}
    </Wrapper>
  );
}
