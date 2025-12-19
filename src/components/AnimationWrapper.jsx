import { motion } from "framer-motion";

const defaultVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const AnimationWrapper = ({
  as: Component = "div",
  variants = defaultVariants,
  delay = 0,
  children,
  className,
}) => {
  return (
    <motion.div
      as={Component}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimationWrapper;
