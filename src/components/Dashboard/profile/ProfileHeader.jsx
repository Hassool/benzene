import { Shield } from "lucide-react"
import { useTranslation } from "react-lite-translation"

const ProfileHeader = ({ isAdmin }) => {
  const { t } = useTranslation()
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">
          {t('profile.header.title')}
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary">
          {t('profile.header.subtitle')}
        </p>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2 px-3 py-1 bg-special/10 text-special rounded-full">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">{t('profile.header.administrator')}</span>
        </div>
      )}
    </div>
  )
}

export default ProfileHeader