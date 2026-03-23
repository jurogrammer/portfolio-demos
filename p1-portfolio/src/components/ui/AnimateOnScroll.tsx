'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const variants = {
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slideUp: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
  slideLeft: { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
};

interface Props { children: React.ReactNode; className?: string; delay?: number; variant?: keyof typeof variants; }

export default function AnimateOnScroll({ children, className, delay = 0, variant = 'slideUp' }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
      variants={variants[variant]} transition={{ duration: 0.5, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}
