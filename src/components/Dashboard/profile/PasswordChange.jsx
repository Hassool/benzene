import { X, Eye, EyeOff, Lock } from "lucide-react"
import PasswordStrengthIndicator from "./PasswordStrengthIndicator"
import { useTranslation } from "l_i18n"

const PasswordChange = ({
  passwordData,
  onChange,
  onCancel,
  onUpdate,
  showCurrentPassword,
  toggleCurrentPassword,
  showNewPassword,
  toggleNewPassword,
  passwordStrength,
  isLoading,
}) => {
  const { t } = useTranslation()
  
  return (
    <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-xl p-6 border border-border dark:border-border-dark">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text dark:text-text-dark">
            {t('profile.password.title')}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-text-secondary dark:text-text-dark-secondary hover:bg-border/20 dark:hover:bg-border-dark/20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current password */}
          <PasswordField
            label={t('profile.password.currentPassword')}
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={onChange}
            visible={showCurrentPassword}
            toggleVisible={toggleCurrentPassword}
          />

          {/* New password */}
          <PasswordField
            label={t('profile.password.newPassword')}
            name="newPassword"
            value={passwordData.newPassword}
            onChange={onChange}
            visible={showNewPassword}
            toggleVisible={toggleNewPassword}
          />

          {passwordData.newPassword && (
            <PasswordStrengthIndicator requirements={passwordStrength.requirements} />
          )}

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">
              {t('profile.password.confirmPassword')}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={onChange}
              className="w-full px-3 py-2 border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark rounded-lg focus:ring-2 focus:ring-special focus:border-transparent"
              placeholder={t('profile.password.confirmPlaceholder')}
            />
            {passwordData.confirmPassword &&
              passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {t('profile.password.passwordsNoMatch')}
                </p>
              )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onUpdate}
            disabled={isLoading || !passwordStrength.isValid || passwordData.newPassword !== passwordData.confirmPassword}
            className="flex items-center gap-2 px-4 py-2 bg-special hover:bg-special-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-4 w-4" />
            {isLoading ? t('profile.password.updating') : t('profile.password.updatePassword')}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-border/20 dark:hover:bg-border-dark/20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
            {t('profile.password.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

const PasswordField = ({ label, name, value, onChange, visible, toggleVisible }) => (
  <div>
    <label className="block text-sm font-medium text-text dark:text-text-dark mb-2">{label}</label>
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 pr-10 border border-border dark:border-border-dark bg-bg dark:bg-bg-dark text-text dark:text-text-dark rounded-lg focus:ring-2 focus:ring-special focus:border-transparent"
        placeholder={label}
      />
      <button
        type="button"
        onClick={toggleVisible}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
)

export default PasswordChange