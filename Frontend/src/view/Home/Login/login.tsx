/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Stepper, { Step } from "../../../components/Stepper";
import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import * as yup from "yup";
import LightRays from "../../../components/Background/lightRays";
import type { ILoginRequest } from "../../../types/auth.types";
import { useAuthStore } from "../../../services/auth.store";
import { useToast } from "../../../hooks/useToast";

const validationSchema = yup.object().shape({
  email: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export const Login = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [, setHasTriedToAdvance] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [, setIsLoginSuccessful] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { toast } = useToast();
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    clearErrors,
  } = useForm<ILoginRequest>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const performLogin = useCallback(async (): Promise<boolean> => {
    try {
      setLoginError(null);
      const data = getValues();
      await login(data);
      setIsLoginSuccessful(true);
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";
      setLoginError(errorMessage);
      toast.error("Login Failed", errorMessage);
      setShowErrors(true);
      setIsLoginSuccessful(false);
      return false;
    }
  }, [getValues, login, toast]);

  const handleBeforeStepChange = useCallback(
    async (currentStep: number, nextStep: number): Promise<boolean> => {
      if (currentStep === 2 && nextStep === 3) {
        setHasTriedToAdvance(true);

        const isValid = await trigger(["email", "password"]);

        if (!isValid) {
          setShowErrors(true);
          return false;
        }

        setShowErrors(false);
        const loginSuccess = await performLogin();

        if (!loginSuccess) {
          return false;
        }

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return true;
      }

      if (nextStep < currentStep) {
        setShowErrors(false);
        setHasTriedToAdvance(false);
        setLoginError(null);

        if (currentStep === 3) {
          setIsLoginSuccessful(false);
        }
      }

      return true;
    },
    [trigger, performLogin, navigate]
  );

  const handleInputChange = useCallback(
    (fieldName: keyof ILoginRequest) => {
      return (_e: React.ChangeEvent<HTMLInputElement>) => {
        if (showErrors && errors[fieldName]) {
          clearErrors(fieldName);
        }
        if (loginError) {
          setLoginError(null);
        }
      };
    },
    [showErrors, errors, clearErrors, loginError]
  );

  const handleDashboardRedirect = () => {
    navigate("/dashboard");
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
        <div className="w-full max-w-2xl">
          <form onSubmit={(e) => e.preventDefault()}>
            <Stepper
              initialStep={1}
              onStepChange={setCurrentStep}
              onBeforeStepChange={handleBeforeStepChange}
              backButtonText="Previous"
              nextButtonText="Next"
              stepCircleContainerClassName="bg-gray-800/50 backdrop-blur-sm border-gray-700"
              contentClassName="min-h-[400px]"
              nextButtonProps={{
                style: { display: currentStep === 3 ? "none" : "flex" },
              }}
              leftButtonContent={
                currentStep !== 3 && (
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-none border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg hover:text-white font-semibold transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-sm"
                  >
                    Don't have an account? Sign up
                  </Link>
                )
              }
            >
              <Step>
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white">
                      Welcome back to Taskify!
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-400">
                      We're glad to see you again! Let's get you logged in.
                    </p>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="space-y-6 py-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Sign In
                    </h3>
                    <p className="text-gray-400">
                      Enter your credentials to continue
                    </p>
                  </div>

                  {/* Mensagem de erro de login */}
                  {loginError && (
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
                        <p className="text-red-400 text-sm">{loginError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Email *
                      </label>
                      <input
                        {...register("email")}
                        onChange={(e) => {
                          register("email").onChange(e);
                          handleInputChange("email")(e);
                        }}
                        type="email"
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                          showErrors && errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.email && (
                        <p className="text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-2 duration-200">
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

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Password *
                      </label>
                      <input
                        {...register("password")}
                        onChange={(e) => {
                          register("password").onChange(e);
                          handleInputChange("password")(e);
                        }}
                        type="password"
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                          showErrors && errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.password && (
                        <p className="text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-2 duration-200">
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          {...register("rememberMe")}
                          type="checkbox"
                          id="rememberMe"
                          className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-300"
                        >
                          Remember me
                        </label>
                      </div>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {/* Indicador de carregamento */}
                  {isLoading && (
                    <div className="flex items-center justify-center pt-4">
                      <div className="flex items-center gap-2 text-blue-400">
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
                        <span>Validating credentials...</span>
                      </div>
                    </div>
                  )}
                </div>
              </Step>

              <Step>
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-green-400">
                      Welcome back!
                    </h3>
                    <p className="text-xl text-gray-300">
                      You have successfully logged in!
                    </p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-semibold mb-4 text-white">
                      Login Details:
                    </h4>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-blue-400 font-medium">
                          {getValues("email")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Login time:</span>
                        <span className="text-white font-medium">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 font-medium flex items-center gap-1">
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Authenticated
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleDashboardRedirect}
                      className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl text-center"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </Step>
            </Stepper>
          </form>
        </div>
      </section>
    </main>
  );
};
