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
          <div className="backdrop-blur-sm bg-white/40 rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-4xl text-blue-700 font-extrabold">LT</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-2 text-blue-900 drop-shadow-lg">LeagueTracker</h2>
            <p className="text-gray-900 text-center mb-2 font-semibold drop-shadow">
              Información acerca de tus partidas de League of Legends y las de tus amigos y oponentes en un solo lugar.
            </p>
          </div>
        </section>
        <div className="w-full flex flex-col items-center pt-32">
          <PlayerSearch />
        </div>
      </div>
    </div>
  );
}


