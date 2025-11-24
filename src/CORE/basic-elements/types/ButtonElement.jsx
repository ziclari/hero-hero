import React from "react";
import { getPath } from "../../config-parser/getPath";
export default function ButtonElement({
  src,
  action,
  label,
  onAction,
  className,
  buttonType,
  style,
}) {
  if (!action) {
    return <img src={getPath(src)} style={style} className={className} />;
  }

  return (
    <button
      type="button"
      className={`button clickable ${
        buttonType ? buttonType : ""
      } ${className}`}
      style={style}
      onClick={() => onAction?.(action)}
    >
      {label && <span>{label}</span>}
      <span className="button__span">
        <svg
          className="button__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 144 139.26"
          aria-hidden="true"
        >
          <path d="M66.26,3.37,0,69.63l66.26,66.26a11.61,11.61,0,0,0,16.42-16.41l-.06-.07L44.44,81.23h88a11.6,11.6,0,0,0,0-23.2h-88L82.62,19.85a11.6,11.6,0,0,0,.06-16.41l-.06-.07A11.62,11.62,0,0,0,66.26,3.37Z" />
        </svg>
      </span>
    </button>
  );
}
