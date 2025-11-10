import { motion, type Variants } from 'framer-motion'

/**
 * TypingIndicator component - Animated dots shown during streaming
 * Uses Framer Motion with staggerChildren for sequential jumping animation
 * Appears below the last message when streaming is active
 */
export function TypingIndicator() {
  const dotVariants: Variants = {
    jump: {
      y: -10,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="flex items-center justify-center gap-2"
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-success"
        variants={dotVariants}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-success"
        variants={dotVariants}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-success"
        variants={dotVariants}
      />
    </motion.div>
  )
}


