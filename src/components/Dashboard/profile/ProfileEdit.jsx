import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslation } from "l_i18n"
import ProfileHeader from "@/components/Dashboard/profile/ProfileHeader"
import MessageAlert from "@/components/Dashboard/profile/MessageAlert"
import ProfileView from "@/components/Dashboard/profile/ProfileView"
import ProfileForm from "@/components/Dashboard/profile/ProfileForm"
import PasswordChange from "@/components/Dashboard/profile/PasswordChange"

const ProfileEdit = () => {
  const { data: session, update: updateSession } = useSession()
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [formData, setFormData] = useState({ fullName: "", phoneNumber: "", email: "" })
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    requirements: {
      minLength: false,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // init form with session user
  useEffect(() => {
    if (session?.user) {
      setFormData({
        fullName: session.user.fullName || "",
        phoneNumber: session.user.phoneNumber || "",
        email: session.user.email || "",
      })
    }
  }, [session])

  // check password strength live
  useEffect(() => {
    if (passwordData.newPassword) {
      checkPasswordStrength(passwordData.newPassword)
    } else {
      setPasswordStrength({
        isValid: false,
        requirements: {
          minLength: false,
          hasLowercase: false,
          hasUppercase: false,
          hasNumber: false,
          hasSpecialChar: false,
        },
      })
    }
  }, [passwordData.newPassword])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  // API CALLS -------------------------

  const checkPasswordStrength = async (password) => {
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-strength", newPassword: password }),
      })
      const data = await res.json()
      if (data.success) {
        setPasswordStrength({
          isValid: data.data.isValid,
          requirements: data.data.requirements,
        })
      }
    } catch (err) {
      console.error("Password strength check failed", err)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/user?id=${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        await updateSession({
          ...session,
          user: {
            ...session.user,
            ...formData,
          },
        })
        setIsEditing(false)
        showMessage("success", t("messages.profileUpdated", "Profile updated successfully"))
      } else {
        showMessage("error", data.msg || t("messages.updateFailed", "Failed to update profile"))
      }
    } catch (err) {
      showMessage("error", t("messages.serverErrorProfile", "Server error updating profile"))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", t("messages.passwordMismatch", "New passwords do not match"))
      return
    }
    if (!passwordStrength.isValid) {
      showMessage("error", t("messages.passwordWeak", "Password does not meet strength requirements"))
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change",
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        showMessage("success", t("messages.passwordUpdated", "Password changed successfully"))
      } else {
        showMessage("error", data.msg || t("messages.passwordUpdateFailed", "Failed to change password"))
      }
    } catch (err) {
      showMessage("error", t("messages.serverErrorPassword", "Server error changing password"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsChangingPassword(false)
    setFormData({
      fullName: session?.user?.fullName || "",
      phoneNumber: session?.user?.phoneNumber || "",
      email: session?.user?.email || "",
    })
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setMessage({ type: "", text: "" })
  }

  // UI -------------------------

  if (!session) {
    return <p className="text-center text-text-secondary">{t("common.loading", "Please sign in to view your profile")}</p>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <ProfileHeader isAdmin={session?.user?.isAdmin} />
      <MessageAlert type={message.type} text={message.text} />

      <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-xl p-6 border border-border dark:border-border-dark">
        {!isEditing ? (
          <ProfileView
            user={session.user}
            onEdit={() => setIsEditing(true)}
            onChangePassword={() => setIsChangingPassword(true)}
          />
        ) : (
          <ProfileForm
            formData={formData}
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>

      {isChangingPassword && (
        <PasswordChange
          passwordData={passwordData}
          onChange={(e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })}
          onCancel={handleCancel}
          onUpdate={handlePasswordUpdate}
          showCurrentPassword={showCurrentPassword}
          toggleCurrentPassword={() => setShowCurrentPassword(!showCurrentPassword)}
          showNewPassword={showNewPassword}
          toggleNewPassword={() => setShowNewPassword(!showNewPassword)}
          passwordStrength={passwordStrength}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

export default ProfileEdit
