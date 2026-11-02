import { useEffect } from 'react';

// One passive scroll listener; only nearby illustrations and levels update per frame.
export function useExperienceEffects() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};

    const setup = () => {
      dispose();
      if (motionPreference.matches || !('IntersectionObserver' in window)) return;

      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]:not([data-section="01"])'));
      const reveals = sections.flatMap(section => Array.from(section.querySelectorAll<HTMLElement>('.reveal')));
      const groups = document.querySelectorAll('.contrasts, .method-steps, .portals');
      groups.forEach(group => Array.from(group.children).forEach((child, index) => {
        (child as HTMLElement).style.setProperty('--reveal-delay', `${Math.min(index, 2) * 90}ms`);
      }));

      const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }), { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

      reveals.forEach(element => {
        // Content already on screen stays visible, including after preference changes.
        if (element.getBoundingClientRect().top < window.innerHeight - 24) element.classList.add('is-visible');
        element.classList.add('reveal-ready');
        revealObserver.observe(element);
      });

      const active = new Set<HTMLElement>();
      const scrollTargets = Array.from(document.querySelectorAll<HTMLElement>('.level, .symbolic-scene, .finale-image'));
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
      let frame = 0;
      const update = () => {
        frame = 0;
        if (document.hidden) return;
        const height = window.innerHeight;
        active.forEach(element => {
          const bounds = element.getBoundingClientRect();
          if (element.classList.contains('level')) {
            const progress = Math.max(0, Math.min(1, (height * 0.85 - bounds.top) / Math.max(1, bounds.height * 0.65)));
            element.style.setProperty('--level-progress', String(progress));
          } else if (finePointer.matches) {
            const position = (height / 2 - (bounds.top + bounds.height / 2)) / height;
            element.style.setProperty('--scene-shift', `${Math.max(-14, Math.min(14, position * 20)).toFixed(2)}px`);
          }
        });
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      const nearbyObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) active.add(element);
          else active.delete(element);
        });
        schedule();
      }, { rootMargin: '100px 0px' });
      scrollTargets.forEach(element => nearbyObserver.observe(element));
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      document.addEventListener('visibilitychange', schedule);

      // A restrained light follows the pointer on portal art, never the text.
      const pointerCleanups: Array<() => void> = [];
      if (finePointer.matches) document.querySelectorAll<HTMLElement>('.portal-art, .method-art').forEach(element => {
        let pointerFrame = 0;
        let x = 50;
        let y = 50;
        const move = (event: PointerEvent) => {
          if (event.pointerType === 'touch') return;
          const bounds = element.getBoundingClientRect();
          x = ((event.clientX - bounds.left) / bounds.width) * 100;
          y = ((event.clientY - bounds.top) / bounds.height) * 100;
          if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
            pointerFrame = 0;
            element.style.setProperty('--light-x', `${x.toFixed(1)}%`);
            element.style.setProperty('--light-y', `${y.toFixed(1)}%`);
          });
        };
        const leave = () => {
          cancelAnimationFrame(pointerFrame);
          pointerFrame = 0;
          element.style.removeProperty('--light-x');
          element.style.removeProperty('--light-y');
        };
        element.addEventListener('pointermove', move, { passive: true });
        element.addEventListener('pointerleave', leave);
        pointerCleanups.push(() => {
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', leave);
          leave();
        });
      });

      dispose = () => {
        revealObserver.disconnect();
        nearbyObserver.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        document.removeEventListener('visibilitychange', schedule);
        pointerCleanups.forEach(cleanup => cleanup());
        reveals.forEach(element => {
          element.classList.remove('reveal-ready', 'is-visible');
          element.style.removeProperty('--reveal-delay');
        });
        scrollTargets.forEach(element => {
          element.style.removeProperty('--level-progress');
          element.style.removeProperty('--scene-shift');
        });
      };
    };

    setup();
    motionPreference.addEventListener('change', setup);
    return () => { motionPreference.removeEventListener('change', setup); dispose(); };
  }, []);
}
