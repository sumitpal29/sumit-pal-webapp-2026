import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observers = sectionIds.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        {
          threshold: 0,
          rootMargin: '-20% 0px -70% 0px',
        }
      );

      observer.observe(element);
      return { id, observer };
    });

    return () => {
      observers.forEach((item) => {
        if (item) {
          const element = document.getElementById(item.id);
          if (element) {
            item.observer.unobserve(element);
          }
        }
      });
    };
  }, [sectionIds]);

  return activeId;
}
