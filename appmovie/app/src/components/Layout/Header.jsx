import logo from "@/assets/logo2.webp";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
 
  Wrench,
  LogIn,
  UserPlus,
  LogOut,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  Sparkles,
  Gavel,
  Boxes,
  History,
  IdCard,
  BarChart3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useUser } from "@/hooks/useUser";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, isAuthenticated, clearUser, authorize } = useUser();

  const userLabel = user?.nombre || user?.correo || "Invitado";

  const funkoItems = [
    {
      title: "Catálogo de Subastas",
      href: "/subastas",
      icon: <Boxes className="h-4 w-4" />,
      show: true,
    },
    {
      title: "Cátalogo de Funkos",
      href: "/funkos",
      icon: <Sparkles className="h-4 w-4" />,
      show: true,
    },
  ];

  const mantItems = [
    {
      title: "Usuarios",
      href: "/users",
      icon: <Wrench className="h-4 w-4" />,
      show: authorize(["Administrador"]),
    },
    {
      title: "Funkos",
      href: "/funkos",
      icon: <Wrench className="h-4 w-4" />,
      show: authorize(["Vendedor", "Administrador"]),
    },
    {
      title: "Subastas",
      href: "/mantenimiento-subastas",
      icon: <Gavel className="h-4 w-4" />,
      show: authorize(["Vendedor", "Administrador"]),
    },
    {
      title: "Reporte de subastas",
      href: "/reportes/subastas-estado",
      icon: <BarChart3 className="h-4 w-4" />,
      show: authorize(["Administrador"]),
    },
  ];

  const userItems = [
    {
      title: "Iniciar sesión",
      href: "/login",
      icon: <LogIn className="h-4 w-4" />,
      show: !isAuthenticated,
    },
    {
      title: "Registrarse",
      href: "/register",
      icon: <UserPlus className="h-4 w-4" />,
      show: !isAuthenticated,
    },
    {
      title: "Historial",
      href: "/mis-pujas",
      icon: <History className="h-4 w-4" />,
      show: isAuthenticated && authorize(["Comprador"]),
    },
    {
      title: "Ver perfil",
      href: "/mi-perfil",
      icon: <IdCard className="h-4 w-4" />,
      show: isAuthenticated && authorize(["Administrador"]),
    },
    {
      title: "Cerrar sesión",
      href: "/",
      icon: <LogOut className="h-4 w-4" />,
      show: isAuthenticated,
      action: () => {
        clearUser();
        setMobileOpen(false);
      },
    },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-neutral-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3 text-white">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-wide hover:opacity-90 transition"
        >
          <img
            src={logo}
            alt="SubastasFunko"
            className="h-14 w-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex flex-1 justify-center">
          <Menubar className="w-auto bg-transparent border-none shadow-none gap-4">
            <MenubarMenu>
              <MenubarTrigger className="text-white/80 font-medium flex items-center gap-2 hover:text-white transition data-[state=open]:text-white">
                <Sparkles className="h-4 w-4" /> Cátalogos
                <ChevronDown className="h-3 w-3 opacity-70" />
              </MenubarTrigger>
              <MenubarContent className="bg-neutral-950/95 backdrop-blur-md border-white/10 text-white">
                {funkoItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <MenubarItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-white/10 transition"
                      >
                        {item.icon} {item.title}
                      </Link>
                    </MenubarItem>
                  ))}
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-white/80 font-medium flex items-center gap-2 hover:text-white transition data-[state=open]:text-white">
                <Layers className="h-4 w-4" /> Mantenimientos
                <ChevronDown className="h-3 w-3 opacity-70" />
              </MenubarTrigger>

              <MenubarContent className="bg-neutral-950/95 backdrop-blur-md border-white/10 text-white">
                {mantItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <MenubarItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-white/10 transition"
                      >
                        {item.icon} {item.title}
                      </Link>
                    </MenubarItem>
                  ))}
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="text-white/80 font-medium flex items-center gap-2 hover:text-white transition data-[state=open]:text-white">
                <User className="h-4 w-4" /> {userLabel}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </MenubarTrigger>
              <MenubarContent className="bg-neutral-950/95 backdrop-blur-md border-white/10 text-white">
                {userItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <MenubarItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        onClick={() => item.action && item.action()}
                        className="flex items-center gap-2 py-2 px-3 rounded-md text-sm hover:bg-white/10 transition"
                      >
                        {item.icon} {item.title}
                      </Link>
                    </MenubarItem>
                  ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
          >
            <ShoppingCart className="h-5 w-5 text-white/85" />
            <Badge
              className="absolute -top-1 -right-1 rounded-full px-2 py-0 text-[10px] font-semibold"
              variant="secondary"
            >
              3
            </Badge>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="bg-neutral-950 text-white border-white/10 w-80">
              <div className="mt-2 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 ring-1 ring-white/10">
                  <img src={logo} alt="SubastasFunko" className="h-6 w-6 object-contain" />
                </span>
                <span className="text-sm font-semibold">
                  Subastas<span className="text-violet-300">Funko</span>
                </span>
              </div>

              <nav className="mt-8 space-y-6">
                <Section title="Funkos" icon={<Sparkles className="h-4 w-4" />}>
                  {funkoItems
                    .filter((item) => item.show)
                    .map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        {item.icon} {item.title}
                      </Link>
                    ))}
                </Section>

                <Section title="Mantenimientos" icon={<Layers className="h-4 w-4" />}>
                  {mantItems
                    .filter((item) => item.show)
                    .map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        {item.icon} {item.title}
                      </Link>
                    ))}
                </Section>

                <Section title={userLabel} icon={<User className="h-4 w-4" />}>
                  {userItems
                    .filter((item) => item.show)
                    .map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => {
                          if (item.action) item.action();
                          else setMobileOpen(false);
                        }}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        {item.icon} {item.title}
                      </Link>
                    ))}
                </Section>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/90">
        {icon} {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}