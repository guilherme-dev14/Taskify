/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Stepper, { Step } from "../../../components/Stepper";
import { Link } from "react-router-dom";
import { useState, useCallback } from "react";
import * as yup from "yup";
import LightRays from "../../../components/Background/lightRays";
import type { ILoginRequest } from "../../../types/auth.types";
const validationSchema: yup.ObjectSchema<ILoginRequest> = yup.object().shape({
  email: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export const Login = () => {
  const [, setCurrentStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [, setHasTriedToAdvance] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    clearErrors,
  } = useForm<ILoginRequest>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const handleBeforeStepChange = useCallback(
    async (currentStep: number, nextStep: number): Promise<boolean> => {
      if (currentStep === 2 && nextStep > currentStep) {
        setHasTriedToAdvance(true);
        const isValid = await trigger(["email", "password"]);

        if (!isValid) {
          setShowErrors(true);
          return false;
        } else {
          setShowErrors(false);
        }
      }

      if (nextStep < currentStep) {
        setShowErrors(false);
        setHasTriedToAdvance(false);
      }

      return true;
    },
    [trigger]
  );

  const onSubmit: SubmitHandler<ILoginRequest> = useCallback((data) => {
    try{
      await login
    }
    );
    // Aqui você redirecionaria para o dashboard ou home
    // navigate('/dashboard');
  }, []);

  const handleInputChange = useCallback(
    (fieldName: keyof ILoginUser) => {
      return (_e: React.ChangeEvent<HTMLInputElement>) => {
        if (showErrors && errors[fieldName]) {
          clearErrors(fieldName);
        }
      };
    },
    [showErrors, errors, clearErrors]
  );

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stepper
              initialStep={1}
              onStepChange={setCurrentStep}
              onBeforeStepChange={handleBeforeStepChange}
              onFinalStepCompleted={() => {
                handleSubmit(onSubmit)();
              }}
              backButtonText="Previous"
              nextButtonText="Next"
              stepCircleContainerClassName="bg-gray-800/50 backdrop-blur-sm border-gray-700"
              contentClassName="min-h-[400px]"
              leftButtonContent={
                <Link
                  to="/register"
                  className="px-6 py-3 bg-none border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg hover:text-white font-semibold transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-sm"
                >
                  Don't have an account? Sign up
                </Link>
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

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Username *
                      </label>
                      <input
                        {...register("username")}
                        onChange={(e) => {
                          register("username").onChange(e);
                          handleInputChange("username")(e);
                        }}
                        type="text"
                        placeholder="Enter your username"
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                          showErrors && errors.username
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.username && (
                        <p className="text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-2 duration-200">
                          {errors.username.message}
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
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                          showErrors && errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.password && (
                        <p className="text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-2 duration-200">
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
                          className="w-4 h-4 bg-gray-800 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 text-blue-600"
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
                </div>
              </Step>

              <Step>
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-4">
                    <div className="text-6xl">🎉</div>
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
                        <span className="text-gray-400">Username:</span>
                        <span className="text-blue-400 font-medium">
                          {getValues("username")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Remember me:</span>
                        <span className="text-green-400 font-medium">
                          {getValues("rememberMe") ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Login time:</span>
                        <span className="text-white font-medium">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Link
                      to="/dashboard"
                      className="inline-block w-full px-8 py-3 bg-primary text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl text-center"
                    >
                      Go to Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="inline-block w-full px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300 text-center"
                    >
                      View Profile
                    </Link>
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
