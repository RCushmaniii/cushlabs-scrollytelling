import { config } from "../../scrollytelling.config.ts";

/** Initialize IntersectionObserver for all .reveal elements.
 *  Reveals are repeatable — elements animate in when visible and reset when scrolled out. */
export function initScrollReveals() {
  if (typeof window === "undefined") return;

  const { threshold, rootMargin } = config.scrollReveal;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold, rootMargin }
  );

  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
  );
  revealElements.forEach((el) => observer.observe(el));
}

/** Initialize staggered reveal for children within a container */
export function initStaggeredReveals(
  containerSelector: string,
  childSelector: string
) {
  if (typeof window === "undefined") return;

  const containers = document.querySelectorAll(containerSelector);
  containers.forEach((container) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const children = entry.target.querySelectorAll(childSelector);
          if (entry.isIntersecting) {
            children.forEach((el) => el.classList.add("visible"));
          } else {
            children.forEach((el) => el.classList.remove("visible"));
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
  });
}

/** Calculate scroll progress (0–1) for the entire page */
export function getScrollProgress(): number {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  return docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
}

/** Get the ID of the currently visible section */
export function getCurrentSection(sections: string[]): string | null {
  const viewportCenter = window.innerHeight / 2;

  for (const id of sections) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
      return id;
    }
  }
  return null;
}
