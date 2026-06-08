import { motion } from 'framer-motion';

export function SectionHeading({ children, action }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="relative inline-block font-outfit text-2xl font-bold text-[var(--text-primary)]">
        {children}
        <motion.span
          className="absolute -bottom-1 left-0 h-0.5 bg-primary"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </h2>
      {action}
    </div>
  );
}