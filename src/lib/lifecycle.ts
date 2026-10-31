// Page lifecycle for Astro View Transitions.
// Component scripts run once, but pages are swapped in place, so anything that binds
// to the DOM must init on every page load and clean up before the next swap.

type Cleanup = () => void;

const cleanups: Cleanup[] = [];

/** Run `init` on every page load. Return a cleanup function to undo it before the next navigation. */
export function onPageLoad(init: () => Cleanup | void) {
  document.addEventListener('astro:page-load', () => {
    const cleanup = init();
    if (cleanup) cleanups.push(cleanup);
  });
}

document.addEventListener('astro:before-swap', () => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
