import { Form, useForm } from "react-hook-form";
import Stepper, { Step } from "../../../components/Stepper";
import { Link } from "react-router-dom";

export const Register = () => {
  const { register, handleSubmit } = useForm();
  const [data, setData] = useState("");

  return (
    <Form onSubmit={handleSubmit((data) => setData(JSON.stringify(data)))}>
      <Stepper
        initialStep={1}
        // onFinalStepCompleted={/*register()*/}
        backButtonText="Previous"
        nextButtonText="Next"
      >
        <Step>
          <h2>Welcome to Taskify!</h2>

          <p> Lets Begin</p>

          <Link
            to="/"
            className="px-4 py-2 bg-none border border-blue-500/30 text-text-dark hover:bg-blue-500/20  rounded-lg hover:text-white font-semibold transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-sm  "
          >
            Already have account? Click here
          </Link>
        </Step>
        <Step>
          <input {...register("email")} placeholder="Email" type="text" />

          <input {...register("username")} placeholder="Username" type="text" />

          <input {...register("password")} placeholder="Password" type="text" />
        </Step>
      </Stepper>
    </Form>
  );
};
