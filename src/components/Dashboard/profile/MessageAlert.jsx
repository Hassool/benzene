import { Check, AlertCircle } from "lucide-react"

const MessageAlert = ({ type, text }) => {
  if (!text) return null

  const isSuccess = type === "success"

  return (
    <div
      className={`p-4 rounded-lg border flex items-center gap-3 ${
        isSuccess
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      }`}
    >
      {isSuccess ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span>{text}</span>
    </div>
  )
}

export default MessageAlert
