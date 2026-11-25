import React from "react";

const Input = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  name,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}

          {required && (
            <span className="text-purple-400 ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full
            bg-[#0F0D1A]
            border border-white/10
            rounded-xl
            py-3 px-4
            ${Icon ? "pl-11" : ""}
            text-white text-sm
            placeholder:text-gray-600
            outline-none
            focus:border-purple-500
            focus:ring-2 focus:ring-purple-500/10
            transition-all duration-300
            disabled:opacity-50
          `}
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-2">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;