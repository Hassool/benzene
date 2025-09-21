import { User, Phone, Mail, Calendar, Edit3, Lock } from "lucide-react"

const ProfileView = ({ user, onEdit, onChangePassword }) => {
  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 bg-special/20 rounded-full flex items-center justify-center">
          <User className="h-10 w-10 text-special" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text dark:text-text-dark">{user.fullName}</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="grid gap-4">
        <InfoRow icon={<User />} label="Full Name" value={user.fullName} />
        <InfoRow icon={<Phone />} label="Phone Number" value={user.phoneNumber} />
        {user.email && <InfoRow icon={<Mail />} label="Email Address" value={user.email} />}
        <InfoRow
          icon={<Calendar />}
          label="Last Login"
          value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-special hover:bg-special-hover text-white rounded-lg transition-colors"
        >
          <Edit3 className="h-4 w-4" />
          Edit Profile
        </button>
        <button
          onClick={onChangePassword}
          className="flex items-center gap-2 px-4 py-2 border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-border/20 dark:hover:bg-border-dark/20 rounded-lg transition-colors"
        >
          <Lock className="h-4 w-4" />
          Change Password
        </button>
      </div>
    </div>
  )
}

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-bg dark:bg-bg-dark rounded-lg">
    <div className="h-5 w-5 text-special">{icon}</div>
    <div>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{label}</p>
      <p className="text-text dark:text-text-dark font-medium">{value}</p>
    </div>
  </div>
)

export default ProfileView
