import { Shield } from "lucide-react"

const ProfileHeader = ({ isAdmin }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">My Profile</h1>
        <p className="text-text-secondary dark:text-text-dark-secondary">
          Manage your account information and settings
        </p>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2 px-3 py-1 bg-special/10 text-special rounded-full">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Administrator</span>
        </div>
      )}
    </div>
  )
}

export default ProfileHeader
