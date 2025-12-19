const baseStyles = "relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2 font-medium leading-none transition duration-160 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2 hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-40 disabled:scale-100";

const variants = {
  primary: "bg-gradient-cta text-white shadow-glow hover:shadow-soft",
  secondary: "border border-brand-soft/60 bg-white/50 text-brand-dark shadow-card hover:bg-white/80",
  ghost: "text-brand-dark hover:bg-brand-soft/15 hover:text-brand-dark",
  cta: "px-7 py-3 text-base font-semibold bg-gradient-heading text-white shadow-glow hover:shadow-soft",
};

const Button = ({ variant = "primary", className = "", children, ...props }) => {
  const variantClasses = variants[variant] ?? variants.primary;
  return (
    <button className={[baseStyles, variantClasses, className].join(" ")} {...props}>
      {children}
    </button>
  );
};

export default Button;
