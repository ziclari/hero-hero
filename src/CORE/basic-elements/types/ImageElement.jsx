import React from "react";
import { getPath } from "../../config-parser/getPath";

export default function ImageElement({
  src,
  className,
  action,
  onAction
}) {
  
  
  const handleClick = () => {
    console.log(action)
    console.log(onAction)
    if (action) onAction?.(action);
  };
  console.log(
    action ? handleClick : undefined
  )
  return (
    <img
      src={getPath(src)}
      className={className}
      onClick={action ? handleClick : undefined}
    />
  );
}
