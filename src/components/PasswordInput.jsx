import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder = "••••••••", 
  required = false,
  minLength,
  className = "",
  showStrength = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength === 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength === 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={minLength}
          className={`w-full rounded-xl border border-brintelli-border px-4 py-2.5 pr-12 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-text transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-textMuted">Password strength:</span>
            <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
              {passwordStrength.label}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brintelli-border">
            <div
              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;






























