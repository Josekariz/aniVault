import Image from "next/image";

function Hero() {
  return (
    <header className="bg-hero bg-center bg-cover bg-no-repeat sm:p-16 py-16 px-8 flex justify-center lg:items-center max-lg:flex-col w-full sm:gap-16 gap-0">
      <div className="flex-1 flex flex-col gap-10">
        <Image
          src="/logo.svg"
          alt="Anime Vault"
          width={101}
          height={96}
          className="object-contain"
        />
        <h1 className="text-5xl font-bold leading-[120%] text-white sm:text-6xl lg:max-w-lg">
          Explore The <span className="red-gradient">Diverse Realms</span> of
          Anime Magic
        </h1>
        <p className="max-w-md text-base text-white/60 sm:text-lg">
          Discover popular series, dig into details, and find your next obsession.
        </p>
        <a
          href="#explore"
          className="inline-flex w-fit items-center rounded-lg bg-gradient-to-r from-[#ff5956] to-[#ee1e38] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]"
        >
          Start exploring
        </a>
      </div>
      <div className="relative h-[50vh] w-full justify-center lg:flex-1">
        <Image
          src="/anime.png"
          alt=""
          fill
          priority
          className="object-contain"
        />
      </div>
    </header>
  );
}

export default Hero;
