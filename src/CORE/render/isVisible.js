export function isVisible(el, activeElements) {
    const byEvent = activeElements?.[el.id] === true;
    const byDefault = el.visible === undefined || el.visible === true;
    return byEvent || byDefault;
  }
  