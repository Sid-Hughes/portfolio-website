// Page lifecycle for Astro View Transitions.
// Component scripts run once, but pages are swapped in place, so anything that binds
// to the DOM must init on every page load and clean up before the next swap.

type Cleanup = () => void;

const cleanups: Cleanup[] = [];
let page = 0;

/**
 * Run `init` on every page load. Return a cleanup function to undo it before the next navigation.
 * Each init runs in its own task, so many components don't add up to one long main-thread block.
 */
export function onPageLoad(init: () => Cleanup | void) {
  document.addEventListener('astro:page-load', () => {
    const loadedPage = page;
    setTimeout(() => {
      if (loadedPage !== page) return; // navigated away before it ran
      const cleanup = init();
      if (cleanup) cleanups.push(cleanup);
    }, 0);
  });
}

document.addEventListener('astro:before-swap', () => {
  page++;
  for (const cleanup of cleanups.splice(0)) cleanup();
});

/** Resolve when the browser is idle (or after `timeout` ms), for work that can wait until after first paint. */
export function whenIdle(timeout = 1500): Promise<void> {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, 200);
  });
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
