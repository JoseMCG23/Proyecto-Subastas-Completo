import { Link } from "react-router-dom";
import { useEffect } from "react";
import Pusher from "pusher-js";
const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, "");
const HERO_IMG = `${baseUrl}/uploads/Portada.jpg`;

const trendingItems = [
  { id: 1, title: "Batman Dark Knight", image: `${baseUrl}/uploads/batmanPortada.jpg`, href: "/funkos" },
  { id: 2, title: "Miles Morales", image: `${baseUrl}/uploads/spidermanPortada.jpg`, href: "/funkos" },
  { id: 3, title: "Iron Man", image: `${baseUrl}/uploads/ironmanPortada.jpeg`, href: "/funkos" },
  { id: 4, title: "Superman", image: `${baseUrl}/uploads/supermanPortada.jpg`, href: "/funkos" },
  { id: 5, title: "Goku", image: `${baseUrl}/uploads/gokuPortada.jpg`, href: "/funkos" },
  { id: 6, title: "Kylo Ren", image: `${baseUrl}/uploads/kyloPortada.jpg`, href: "/funkos" },
];

const favoriteItems = [
  { id: 7, title: "Stitch", image: `${baseUrl}/uploads/stichPortada.jpg`, href: "/funkos" },
  { id: 8, title: "Snoopy Woodstock", image: `${baseUrl}/uploads/snoopyPortada.jpg`, href: "/funkos" },
  { id: 9, title: "Cody Rhodes", image: `${baseUrl}/uploads/codyPortada.jpg`, href: "/funkos" },
  { id: 10, title: "Dustin", image: `${baseUrl}/uploads/dustinPortada.jpg`, href: "/funkos" },
  { id: 11, title: "Bray Wyatt", image: `${baseUrl}/uploads/brayPortada.jpg`, href: "/funkos" },
  { id: 12, title: "Mbappé", image: `${baseUrl}/uploads/mbapperPortada.jpg`, href: "/funkos" },
];

function useScrollAnimation() {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

export function Home() {
  useScrollAnimation();
  useEffect(() => {

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER
    });

    const channel = pusher.subscribe("subasta-canal");

    channel.bind("evento-prueba", function (data) {
      console.log("Evento recibido:", data);

    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };

  }, []);
  return (
    <div className="w-full pb-16">
      {/* hero grande */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden border-y border-white/10 bg-black animate-[fadeIn_1s_ease]">
        <img
          src={HERO_IMG}
          alt="Portada"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%] opacity-70"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-500/30 via-transparent to-transparent" />

        <div className="relative flex min-h-[calc(100vh-80px)] items-center px-6 py-14 md:px-10 lg:px-16 xl:px-24 2xl:px-28">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-violet-400/25 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-200">
              SUBASTAS FUNKO POP
            </span>

            <h1 className="mt-6 font-extrabold leading-[0.95] tracking-tight">
              <span className="block text-5xl text-white md:text-6xl xl:text-7xl 2xl:text-8xl">
                Colecciona lo
              </span>
              <span className="mt-3 block bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-6xl text-transparent md:text-7xl xl:text-8xl 2xl:text-[7rem]">
                exclusivo
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg xl:text-xl">
              El marketplace donde coleccionistas compiten por las figuras más codiciadas.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/subastas"
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95"
              >
                Ver Subastas →
              </Link>

              <Link
                to="/funkos"
                className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white/90 ring-1 ring-white/15 transition hover:bg-white/15"
              >
                Ver Funko Pops →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CARRUSELES */}
      <div className="mt-14 space-y-12 px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="fade-up">
          <CarouselSection
            title="Lo más buscado"
            items={trendingItems}
            animationClass="animate-marquee"
          />
        </div>

        <div className="fade-up">
          <CarouselSection
            title="Favoritos del momento"
            items={favoriteItems}
            animationClass="animate-marquee-slow"
          />
        </div>
      </div>
    </div>
  );
}

function CarouselSection({ title, items, animationClass }) {
  const duplicatedItems = [...items, ...items];

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
      </div>

      <div className="overflow-hidden">
        <div
          className={`flex w-max gap-5 ${animationClass} hover:[animation-play-state:paused]`}
        >
          {duplicatedItems.map((item, index) => (
            <FunkoCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FunkoCard({ item }) {
  return (
    <Link
      to={item.href}
      className="group relative block h-[280px] w-[240px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:h-[300px] md:w-[260px] xl:h-[320px] xl:w-[280px]"
    >
      <img
        src={item.image}
        alt={item.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = HERO_IMG;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

      <div className="absolute bottom-0 p-4">
        <p className="text-base font-semibold text-white drop-shadow md:text-lg">
          {item.title}
        </p>
      </div>
    </Link>
  );
}