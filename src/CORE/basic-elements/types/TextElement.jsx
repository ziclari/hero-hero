// TextElement.jsx
import React from "react";

export default function TextElement({
  content,
  className = "",
  action,
  onAction,
}) {
  const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  const Wrapper = action
    ? ({ children }) => (
        <button
          className={className}
          onClick={() => onAction?.(action)}
        >
          {children}
        </button>
      )
    : React.Fragment;

  const contentElement = isHTML ? (
    <div
      className={className}
      style={{ whiteSpace: "pre-line" }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  ) : (
    <div className={className} style={{ whiteSpace: "pre-line" }}>
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
