/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as yup from "yup";
import LightRays from "../../../components/Background/lightRays";
import authService from "../../../services/Auth/auth.service";

interface ForgotPasswordForm {
  email: string;
}

const validationSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<ForgotPasswordForm> = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending forgot password request for:", data.email);
      await authService.forgotPassword(data.email);
      console.log("Forgot password request successful");
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isSuccess) {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center"
          >
            <div className="text-6xl mb-6">📧</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-400 mb-6">
              We've sent a password reset link to{" "}
              <span className="text-blue-400 font-medium">
                {getValues("email")}
              </span>
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder.
              </p>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={async () => {
                    const email = getValues("email");
                    await authService.forgotPassword(email);
                  }}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300"
                >
                  Resend Email
                </button>

                <Link
                  to="/login"
                  className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300 text-center block"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-4"
                >
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
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
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
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default ForgotPassword;
