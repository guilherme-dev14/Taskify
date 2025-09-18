/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LightRays from "../../../components/Background/lightRays";
import authService from "../../../services/Auth/auth.service";

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setErrorMessage("Invalid or missing reset token.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage("Invalid reset token.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-900 text-white">
      <div className="fixed inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#f3f4f6"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>

      <section className="relative z-10 grid place-items-center min-h-screen p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Reset Password
                  </h1>
                  <p className="text-gray-400">
                    Enter your new password below.
                  </p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-red-400 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                {token && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        {...register("password")}
                        type="password"
                        placeholder="Enter your new password"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                          errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {errors.password && (
                        <p className="text-red-400 text-sm flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        {...register("confirmPassword")}
                        type="password"
                        placeholder="Confirm your new password"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                          errors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Resetting...</span>
                        </div>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </form>
                )}

                {/* Back to Login */}
                <div className="text-center mt-6">
                  <Link
                    to="/login"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-400 mb-4">
                    Password Reset Successful!
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Your password has been successfully reset. You can now log
                    in with your new password.
                  </p>
                  <p className="text-gray-400 text-sm mb-8">
                    Redirecting to login page in 3 seconds...
                  </p>

                  <Link
                    to="/login"
                    className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                  >
                    Go to Login Now
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
