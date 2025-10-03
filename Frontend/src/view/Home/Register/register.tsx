/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Stepper, { Step } from "../../../components/Stepper";
import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import * as yup from "yup";
import LightRays from "../../../components/Background/lightRays";
import type { IRegisterRequest } from "../../../types/auth.types";
import { useAuthStore } from "../../../services/auth.store";
import { useTranslation } from 'react-i18next';

export const Register = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [, setHasTriedToAdvance] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [, setIsRegistrationSuccessful] = useState(false);

  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validationSchema: yup.ObjectSchema<IRegisterRequest> = yup
    .object()
    .shape({
      email: yup.string().email(t('auth.validation.emailInvalid')).required(t('auth.validation.emailRequired')),
      username: yup
        .string()
        .min(3, t('auth.validation.usernameMinLength'))
        .max(30, t('auth.validation.usernameMaxLength'))
        .required(t('auth.validation.usernameRequired')),
      password: yup
        .string()
        .min(6, t('auth.validation.passwordMinLength'))
        .required(t('auth.validation.passwordRequired')),
      firstName: yup.string().required(t('auth.validation.firstNameRequired')),
      lastName: yup.string().optional(),
    });

  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    clearErrors,
  } = useForm<IRegisterRequest>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const performRegistration = useCallback(async (): Promise<boolean> => {
    try {
      setRegistrationError(null);
      const data = getValues();
      await signup(data);
      setIsRegistrationSuccessful(true);
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        t('auth.register.registrationFailed');
      setRegistrationError(errorMessage);
      setIsRegistrationSuccessful(false);
      return false;
    }
  }, [getValues, signup, t]);

  const handleBeforeStepChange = useCallback(
    async (currentStep: number, nextStep: number): Promise<boolean> => {
      if (currentStep === 2 && nextStep === 3) {
        setHasTriedToAdvance(true);
        const isValid = await trigger(["firstName", "lastName"]);

        if (!isValid) {
          setShowErrors(true);
          return false;
        }
        setShowErrors(false);
        return true;
      }

      if (currentStep === 3 && nextStep === 4) {
        setHasTriedToAdvance(true);
        const isValid = await trigger(["email", "username", "password"]);

        if (!isValid) {
          setShowErrors(true);
          return false;
        }

        setShowErrors(false);
        const registrationSuccess = await performRegistration();

        if (!registrationSuccess) {
          return false;
        }

        return true;
      }

      if (nextStep < currentStep) {
        setShowErrors(false);
        setHasTriedToAdvance(false);
        setRegistrationError(null);

        if (currentStep === 4) {
          setIsRegistrationSuccessful(false);
        }
      }

      return true;
    },
    [trigger, performRegistration]
  );

  const handleInputChange = useCallback(
    (fieldName: keyof IRegisterRequest) => {
      return (_e: React.ChangeEvent<HTMLInputElement>) => {
        if (showErrors && errors[fieldName]) {
          clearErrors(fieldName);
        }
        if (registrationError) {
          setRegistrationError(null);
        }
      };
    },
    [showErrors, errors, clearErrors, registrationError]
  );

  const handleLoginRedirect = () => {
    navigate("/login");
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
              backButtonText={t('auth.stepper.previous')}
              nextButtonText={t('auth.stepper.next')}
              stepCircleContainerClassName="bg-gray-800/50 backdrop-blur-sm border-gray-700"
              contentClassName="min-h-[400px]"
              nextButtonProps={{
                style: { display: currentStep === 4 ? "none" : "flex" },
              }}
              leftButtonContent={
                currentStep !== 4 && (
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-none border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg hover:text-white font-semibold transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-sm"
                  >
                    {t('auth.register.alreadyHaveAccount')}
                  </Link>
                )
              }
            >
              <Step>
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white">
                      {t('auth.register.title')}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-400">
                      {t('auth.register.subtitle')}
                    </p>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="space-y-6 py-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t('auth.register.personalInformation')}
                    </h3>
                    <p className="text-gray-400">
                      {t('auth.register.tellAboutYourself')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {t('auth.register.firstNameLabel')} *
                      </label>
                      <input
                        {...register("firstName")}
                        onChange={(e) => {
                          register("firstName").onChange(e);
                          handleInputChange("firstName")(e);
                        }}
                        type="text"
                        placeholder={t('auth.register.firstNamePlaceholder')}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                          showErrors && errors.firstName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.firstName && (
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
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {t('auth.register.lastNameLabel')}
                      </label>
                      <input
                        {...register("lastName")}
                        onChange={(e) => {
                          register("lastName").onChange(e);
                          handleInputChange("lastName")(e);
                        }}
                        type="text"
                        placeholder={t('auth.register.lastNamePlaceholder')}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                          showErrors && errors.lastName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.lastName && (
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
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="space-y-6 py-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t('auth.register.accountDetails')}
                    </h3>
                    <p className="text-gray-400">
                      {t('auth.register.setupCredentials')}
                    </p>
                  </div>

                  {registrationError && (
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
                        <p className="text-red-400 text-sm">
                          {registrationError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {t('auth.register.emailLabel')} *
                      </label>
                      <input
                        {...register("email")}
                        onChange={(e) => {
                          register("email").onChange(e);
                          handleInputChange("email")(e);
                        }}
                        type="email"
                        placeholder={t('auth.register.emailPlaceholder')}
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
                        {t('auth.register.usernameLabel')} *
                      </label>
                      <input
                        {...register("username")}
                        onChange={(e) => {
                          register("username").onChange(e);
                          handleInputChange("username")(e);
                        }}
                        type="text"
                        placeholder={t('auth.register.usernamePlaceholder')}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                          showErrors && errors.username
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.username && (
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
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {t('auth.register.passwordLabel')} *
                      </label>
                      <input
                        {...register("password")}
                        onChange={(e) => {
                          register("password").onChange(e);
                          handleInputChange("password")(e);
                        }}
                        type="password"
                        placeholder={t('auth.register.passwordPlaceholder')}
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
                  </div>

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
                        <span>{t('auth.register.creatingAccount')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Step>

              <Step>
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h3 className="text-3xl font-bold text-green-400">
                      {t('auth.register.congratulations')}
                    </h3>
                    <p className="text-xl text-gray-300">
                      {t('auth.register.accountCreated')}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-semibold mb-4 text-white">
                      {t('auth.register.accountSummary')}
                    </h4>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{t('auth.register.name')}</span>
                        <span className="text-white font-medium">
                          {getValues("firstName")} {getValues("lastName") || ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{t('auth.register.emailLabel')}:</span>
                        <span className="text-blue-400 font-medium">
                          {getValues("email")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{t('auth.register.username')}</span>
                        <span className="text-green-400 font-medium">
                          {getValues("username")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{t('auth.login.status')}</span>
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
                          {t('auth.register.accountCreatedStatus')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleLoginRedirect}
                      className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
                    >
                      {t('auth.register.goToLogin')}
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
