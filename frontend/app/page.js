import Image from "next/image";
export default function Home() {
  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome!</h1>
          <p className="py-6">
            AiO app which allows to manage your tasks and work on them with your
            friends!
          </p>
          <a href="/login">
            <button className="btn btn-primary">Get Started!</button>
          </a>
        </div>
      </div>
    </div>
  );
}
