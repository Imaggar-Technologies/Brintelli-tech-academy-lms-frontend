import { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Country codes for phone dropdown (India, UAE, Kenya first as requested; then others).
 * Value stored/displayed as full phone e.g. "+91 9876543210".
 */
export const PHONE_COUNTRY_CODES = [
  { code: '+91', country: 'India', dial: '91' },
  { code: '+971', country: 'UAE', dial: '971' },
  { code: '+254', country: 'Kenya', dial: '254' },
  { code: '+1', country: 'US/Canada', dial: '1' },
  { code: '+44', country: 'UK', dial: '44' },
  { code: '+61', country: 'Australia', dial: '61' },
  { code: '+49', country: 'Germany', dial: '49' },
  { code: '+33', country: 'France', dial: '33' },
  { code: '+81', country: 'Japan', dial: '81' },
  { code: '+65', country: 'Singapore', dial: '65' },
  { code: '+966', country: 'Saudi Arabia', dial: '966' },
  { code: '+27', country: 'South Africa', dial: '27' },
];

const DEFAULT_COUNTRY = PHONE_COUNTRY_CODES[0];

/**
 * Parse existing phone value into { countryCode, number }.
 * Handles "+91 9876543210", "+919876543210", "919876543210", "9876543210".
 */
export function parsePhoneValue(value) {
  if (!value || typeof value !== 'string') {
    return { countryCode: DEFAULT_COUNTRY.code, number: '' };
  }
  const trimmed = value.trim().replace(/\s+/g, ' ');
  for (const c of PHONE_COUNTRY_CODES) {
    const dial = c.dial;
    if (trimmed.startsWith(`+${dial}`) || trimmed.startsWith(dial)) {
      const rest = trimmed.replace(new RegExp(`^\\+?${dial}\\s*`), '').replace(/\D/g, '');
      return { countryCode: c.code, number: rest };
    }
  }
  // No matching country: treat as local number, default to India
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length >= 10) {
    return { countryCode: DEFAULT_COUNTRY.code, number: digitsOnly.slice(-10) };
  }
  return { countryCode: DEFAULT_COUNTRY.code, number: digitsOnly };
}

/**
 * Build full phone string for API: "+91" + "9876543210" => "+91 9876543210"
 */
export function formatFullPhone(countryCode, number) {
  const digits = (number || '').replace(/\D/g, '');
  if (!digits) return '';
  return `${countryCode} ${digits}`.trim();
}

/**
 * Phone input with country code dropdown.
 * - value: full phone string e.g. "+91 9876543210"
 * - onChange: (fullPhoneString) => void
 */
const PhoneInput = ({
  value = '',
  onChange,
  placeholder = 'Phone number',
  className = '',
  inputClassName = '',
  disabled = false,
  id,
  name = 'phone',
  'aria-label': ariaLabel = 'Phone number',
}) => {
  const parsed = useMemo(() => parsePhoneValue(value), [value]);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [number, setNumber] = useState(parsed.number);

  useEffect(() => {
    const p = parsePhoneValue(value);
    setCountryCode(p.countryCode);
    setNumber(p.number);
  }, [value]);

  const handleCountryChange = (e) => {
    const code = e.target.value;
    setCountryCode(code);
    const full = formatFullPhone(code, number);
    onChange?.(full);
  };

  const handleNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setNumber(raw);
    const full = formatFullPhone(countryCode, raw);
    onChange?.(full);
  };

  const selectClassName =
    'h-full pl-3 pr-8 py-2 border-0 bg-transparent text-sm text-text focus:outline-none focus:ring-0 cursor-pointer appearance-none rounded-l-lg border-r border-brintelli-border bg-brintelli-baseAlt';
  const inputBaseClass =
    inputClassName ||
    'flex-1 min-w-0 px-3 py-2 border-0 text-sm text-text placeholder:text-textMuted focus:outline-none focus:ring-0 bg-brintelli-baseAlt';

  return (
    <div
      className={`flex items-stretch rounded-lg border border-brintelli-border bg-brintelli-baseAlt focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 ${className}`}
    >
      <div className="relative flex items-center shrink-0">
        <select
          value={countryCode}
          onChange={handleCountryChange}
          disabled={disabled}
          className={selectClassName}
          aria-label="Country code"
          name={name ? `${name}_country` : undefined}
        >
          {PHONE_COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.country}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted pointer-events-none" />
      </div>
      <input
        type="tel"
        id={id}
        name={name}
        value={number}
        onChange={handleNumberChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${inputBaseClass} rounded-r-lg`}
        autoComplete="tel"
      />
    </div>
  );
};

export default PhoneInput;
