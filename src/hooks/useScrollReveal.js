import { useEffect } from 'react';

export default function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stat-pop');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); } }),
      { threshold: 0.12 }
    );

    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}
