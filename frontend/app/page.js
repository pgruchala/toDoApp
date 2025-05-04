import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>hrllo wrld</h1>
      <div className="join join-vertical">
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Default"
          value="default"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Retro"
          value="retro"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Cyberpunk"
          value="cyberpunk"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Valentine"
          value="valentine"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Aqua"
          value="aqua"
        />
      </div>
    </div>
  );
}
