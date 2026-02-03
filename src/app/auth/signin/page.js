"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Phone, Lock, AlertCircle } from "lucide-react";
import { useTranslation } from "l_i18n";
import Link from "next/link";

export default function SignIn() {
  const {isRTL} = useTranslation()
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneChange = (e) => {
    // Just strip spaces, let user type in +countrycode format
    setPhoneNumber(e.target.value.replace(/\s/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        phoneNumber: phoneNumber.replace(/[^\d+]/g, ""), // send only digits + plus
        password,
      });

      if (result?.error) {
        setError("Invalid phone number or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light dark:bg-gradient-dark p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text dark:text-text-dark font-montserrat mb-2">
            {! isRTL ? "Welcome Back" : "مرحبًا بعودتك"}
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary font-inter">
            {! isRTL ? "Sign in to your account to continue" : "قم بتسجيل الدخول إلى حسابك للمتابعة"}
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary dark:bg-bg-dark-secondary backdrop-blur-sm border border-border dark:border-border-dark rounded-2xl p-8 shadow-xl space-y-6"
        >
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300 text-sm font-inter">{error}</p>
            </div>
          )}

          {/* Phone Number Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text dark:text-text-dark font-inter">
              {isRTL ? "Phone Number" : "رقم الهاتف "}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-text-secondary dark:text-text-dark-secondary" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+123456789123"
                className="w-full pl-10 pr-4 py-3 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark placeholder-text-secondary dark:placeholder-text-dark-secondary focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent transition-all duration-200 font-inter"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text dark:text-text-dark font-inter">
              {! isRTL ? "Password" : "كلمة المرور "}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-secondary dark:text-text-dark-secondary" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full ltr pl-10 pr-12 py-3 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-xl text-text dark:text-text-dark placeholder-text-secondary dark:placeholder-text-dark-secondary focus:outline-none focus:ring-2 focus:ring-special focus:border-transparent transition-all duration-200 font-inter"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-special hover:bg-special-hover disabled:bg-special/50 text-white py-3 px-4 rounded-xl font-medium font-inter transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                {! isRTL ? "Signing In..." : "جاري تسجيل الدخول... "}
              </>
            ) : (
              `${! isRTL ? "Sign In" : "سجل الدخول "}`
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-border-dark"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg-secondary dark:bg-bg-dark-secondary text-text-secondary dark:text-text-dark-secondary font-inter">
                {! isRTL ? "request an account" : "اطلب حسابا"}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          {! isRTL ? 
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary font-inter">
            By signing in, you agree to our{" "}
            <Link href="/terms-of-service" className="text-special hover:text-special-hover transition-colors duration-200">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-special hover:text-special-hover transition-colors duration-200">
              Privacy Policy
            </Link>
            and{" "}
            <Link href="/privacy-policy" className="text-special hover:text-special-hover transition-colors duration-200">
              Cookie Policy
            </Link>
          </p>
          :
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary font-inter">
            بتسجيل الدخول، فإنك توافق على{" "}
            <Link href="/terms-of-service" className="text-special hover:text-special-hover transition-colors duration-200">
              شروط الخدمة
            </Link>{" "}
            و{" "}
            <Link href="/privacy-policy" className="text-special hover:text-special-hover transition-colors duration-200">
              سياسة الخصوصية
            </Link>{" "}
            و{" "}
            <Link href="/privacy-policy" className="text-special hover:text-special-hover transition-colors duration-200">
              سياسة ملفات تعريف الارتباط
            </Link>
          </p>

        }
        </div>
      </div>
    </div>
  );
}
