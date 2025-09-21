const PasswordStrengthIndicator = ({ requirements }) => {
  if (!requirements) return null

  const items = [
    { key: "minLength", label: "8+ characters" },
    { key: "hasLowercase", label: "Lowercase" },
    { key: "hasUppercase", label: "Uppercase" },
    { key: "hasNumber", label: "Number" },
    { key: "hasSpecialChar", label: "Special char" },
  ]

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map(({ key, label }) => {
          const ok = requirements[key]
          return (
            <div
              key={key}
              className={`flex items-center gap-1 ${
                ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${ok ? "bg-green-600" : "bg-red-600"}`} />
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PasswordStrengthIndicator
