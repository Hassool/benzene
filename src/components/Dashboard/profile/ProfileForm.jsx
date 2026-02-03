import { X, Save } from "lucide-react"
import { useTranslation } from "l_i18n"

const ProfileForm = ({ formData, onChange, onSave, onCancel, isLoading }) => {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">
          {t('profile.form.editProfile')}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-text-secondary dark:text-text-dark-secondary hover:bg-border/20 dark:hover:bg-border-dark/20 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <InputField 
          label={t('profile.form.fullName')} 
          name="fullName" 
          value={formData.fullName} 
          onChange={onChange} 
        />
        <InputField 
          label={t('profile.form.phoneNumber')} 
          name="phoneNumber" 
          value={formData.phoneNumber} 
          onChange={onChange} 
        />
        <InputField 
          label={t('profile.form.emailOptional')} 
          name="email" 
          value={formData.email} 
          onChange={onChange} 
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-special hover:bg-special-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isLoading ? t('profile.form.saving') : t('profile.form.saveChanges')}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-border/20 dark:hover:bg-border-dark/20 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
          {t('profile.form.cancel')}
        </button>
      </div>
    </div>
  )
}

const InputField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">{label}</label>
    <input
      type={name === "phoneNumber" ? "tel" : name === "email" ? "email" : "text"}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark rounded-lg focus:ring-2 focus:ring-special focus:border-transparent"
    />
  </div>
)

export default ProfileForm