import { Link } from "react-router-dom";
import logo from "@/assets/logo2.webp";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#1f1f1f]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-5 text-center">

        {/* Logo */}
        <Link to="/" className="mb-2">
          <img
            src={logo}
            alt="SubastasFunko"
            className="h-10 w-auto object-contain opacity-95"
          />
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 text-sm text-sky-400">
          <Link to="/subastas" className="hover:text-sky-300 transition">
            Explorar
          </Link>
          <Link to="/funkos" className="hover:text-sky-300 transition">
            Colección
          </Link>
          <Link to="/user/create" className="hover:text-sky-300 transition">
            Registrarse
          </Link>
          <Link to="/user/login" className="hover:text-sky-300 transition">
            Iniciar sesión
          </Link>
        </nav>

        {}
        <p className="mt-2 text-xs text-white/40">
          © {new Date().getFullYear()} SubastasFunko
        </p>

      </div>
    </footer>
  );
}