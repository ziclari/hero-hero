// TextElement.jsx
import React from "react";

export default function TextElement({
  content,
  className = "",
  action,
  onAction,
}) {
  const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  const mergedClassName = `${skin.wrapper} ${className}`.trim();

  const Wrapper = action
    ? ({ children }) => (
        <button
          className={skin.actionWrapper}
          onClick={() => onAction?.(action)}
        >
          {children}
        </button>
      )
    : React.Fragment;

  const contentElement = isHTML ? (
    <div
      className={mergedClassName}
      style={{ whiteSpace: "pre-line" }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  ) : (
    <div className={mergedClassName} style={{ whiteSpace: "pre-line" }}>
      {content}
    </div>
  );

  return <Wrapper>{contentElement}</Wrapper>;
}

/*
export default function TextBase({
  content,
  isHTML = false,
  style = {},
  className = "",
  onAction,
  action,
  wrapper: Wrapper = "div",
}) {
  const handleClick = () => {
    if (action) onAction?.(action);
  };

  const props = {
    className,
    style,
    onClick: action ? handleClick : undefined,
  };

  if (isHTML) {
    return (
      <Wrapper {...props} dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  return <Wrapper {...props}>{content}</Wrapper>;
}*/
