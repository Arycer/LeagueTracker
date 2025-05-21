import {PlayerSearch} from "@/components/PlayerSearch";
import Image from "next/image";
import bgTop from "@/assets/bg-top.webp";

export default function Home() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={bgTop}
            alt="Fondo principal"
            fill
            className="object-cover object-center opacity-90"
            priority
          />
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center w-full">
        <section className="w-full max-w-2xl flex flex-col items-center mb-10">
          <div className="w-full flex flex-col items-center mb-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-2 drop-shadow-lg">
              <span className="text-sky-400">League</span>
              <span className="text-white">Tracker</span>
            </h1>
          </div>
          <div className="w-full flex flex-col items-center mb-8">
            <PlayerSearch />
          </div>
          <div className="backdrop-blur-sm bg-white/40 rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center w-full">
            <p className="text-gray-900 text-center mb-2 font-semibold drop-shadow">
              Información acerca de tus partidas de League of Legends y las de tus amigos y oponentes en un solo lugar.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}


