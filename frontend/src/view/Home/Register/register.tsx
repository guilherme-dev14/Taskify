/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Stepper, { Step } from "../../../components/Stepper";
import { Link } from "react-router-dom";
import { useState, useCallback } from "react";
import * as yup from "yup";
import LightRays from "../../../components/Background/lightRays";

interface IRegisterUser {
  email: string;
  username: string;
  password: string;
}

const validationSchema = yup.object({
  email: yup.string().email("Invalid Email").required("Email is required"),
  username: yup
    .string()
    .min(3, "Username need at least three caracters")
    .max(30, "Username must be maximum 30 caracters")
    .required("Username is required"),
  password: yup
    .string()
    .min(6, "Password need at least 6 caracters")
    .required("Password is required"),
});

export const Register = () => {
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
  } = useForm<IRegisterUser>({
    resolver: yupResolver(validationSchema),
  });

  const handleBeforeStepChange = useCallback(
    async (currentStep: number, nextStep: number): Promise<boolean> => {
      if (currentStep === 2 && nextStep > currentStep) {
        setHasTriedToAdvance(true);

        const isValid = await trigger(["email", "username", "password"]);

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

  const onSubmit = useCallback((data: IRegisterUser) => {
    console.log("Dados do formulário:", data);
    alert(
      `Account created successfully!\nEmail: ${data.email}\nUsername: ${data.username}`
    );
  }, []);

  const handleInputChange = useCallback(
    (fieldName: keyof IRegisterUser) => {
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
              onFinalStepCompleted={handleSubmit(onSubmit)}
              backButtonText="Previous"
              nextButtonText="Next"
              stepCircleContainerClassName="bg-gray-800/50 backdrop-blur-sm border-gray-700"
              contentClassName="min-h-[400px]"
              leftButtonContent={
                <Link
                  to="/login"
                  className="px-6 py-3 bg-none border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg hover:text-white font-semibold transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-sm"
                >
                  Already have an account?
                </Link>
              }
            >
              <Step>
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white">
                      Welcome to Taskify!
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-400">
                      Let's start with a few steps to register your account!
                    </p>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="space-y-6 py-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Create Account
                    </h3>
                    <p className="text-gray-400">
                      Fill in your information to continue
                    </p>
                  </div>

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
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                          showErrors && errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                      {showErrors && errors.email && (
                        <p className="text-red-400 text-sm flex items-center gap-1 animate-in slide-in-from-top-2 duration-200">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

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
                  </div>
                </div>
              </Step>

              <Step>
                <div className="text-center space-y-8 py-8">
                  <div className="space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h3 className="text-3xl font-bold text-green-400">
                      Congratulations!
                    </h3>
                    <p className="text-xl text-gray-300">
                      Your account was created successfully!
                    </p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-semibold mb-4 text-white">
                      Account Summary:
                    </h4>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-blue-400 font-medium">
                          {getValues("email")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-green-400 font-medium">
                          {getValues("username")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      to="/login"
                      className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
                    >
                      Go to Login
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
