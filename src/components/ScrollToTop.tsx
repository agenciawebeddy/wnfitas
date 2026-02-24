"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ containerRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const toggleVisibility = () => {
      if (container.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    container.addEventListener('scroll', toggleVisibility);
    return () => container.removeEventListener('scroll', toggleVisibility);
  }, [containerRef]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-900/40 transition-all animate-in fade-in zoom-in duration-300 group"
      title="Voltar ao topo"
    >
      <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
    </button>
  );
};

export default ScrollToTop;