export function isClientPointInsideElement(
  clientX: number,
  clientY: number,
  el: HTMLElement,
): boolean {
  const r = el.getBoundingClientRect();
  return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
}

export function isPointerOverDropZone(
  clientX: number,
  clientY: number,
  dropZone: HTMLElement,
  dragRoot: HTMLElement,
): boolean {
  const prevPe = dragRoot.style.pointerEvents;
  dragRoot.style.pointerEvents = "none";
  const top = document.elementFromPoint(clientX, clientY);
  dragRoot.style.pointerEvents = prevPe;

  if (top && (dropZone === top || dropZone.contains(top))) {
    return true;
  }

  return isClientPointInsideElement(clientX, clientY, dropZone);
}
