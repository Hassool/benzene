import { useTranslation } from "@/lib/TranslationProvider"

const PasswordStrengthIndicator = ({ requirements }) => {
  const { t } = useTranslation()
  
  if (!requirements) return null

  const items = [
    { key: "minLength", label: t('profile.strength.minLength') },
    { key: "hasLowercase", label: t('profile.strength.lowercase') },
    { key: "hasUppercase", label: t('profile.strength.uppercase') },
    { key: "hasNumber", label: t('profile.strength.number') },
    { key: "hasSpecialChar", label: t('profile.strength.specialChar') },
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