import { animate, eases } from "animejs";

export function animateCartLineExit(el: HTMLElement): Promise<void> {
  const anim = animate(el, {
    opacity: [1, 0],
    translateX: [0, 18],
    scale: [1, 0.96],
    duration: 340,
    ease: eases.out(3),
  });
  return anim.then(() => undefined);
}
