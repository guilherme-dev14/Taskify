import Threads from "../../components/Background/threads";
import { Link } from "react-router-dom";
import TextType from "../../components/TextType";

export const Home = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-700 text-white">
      <div className="fixed inset-0 z-0">
        <Threads
          color={[0, 0, 0]}
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
        />
      </div>

      <section className="relative z-10 grid place-items-center min-h-screen p-6">
        <div className="w-full max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white">Taskify</h1>
            <TextType
              text={"Organize your projects, boost your productivity."}
              typingSpeed={75}
              pauseDuration={1500}
              cursorCharacter="|"
              className="text-4xl pt-8 font-bold text-white "
            />
          </div>

          <div className="flex items-center justify-center gap-5">
            <Link
              to="/register"
              className="px-8 py-4 bg-none border border-blue-500/30 text-text-dark hover:bg-blue-500/20  rounded-lg hover:text-white font-semibold transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-sm  "
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-none border border-blue-500/30 text-text-dark hover:bg-blue-500/20 rounded-lg hover:text-white  font-semibold transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
