import Header from "./Header";
import { Footer } from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { UserProvider } from "@/context/UserProvider";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <UserProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/25 via-neutral-950 to-neutral-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-transparent to-transparent" />
        </div>

        <Header />

        <main className="pt-20 pb-16">
          {isHome ? (
            <Outlet />
          ) : (
            <div className="mx-auto max-w-7xl px-6">
              <Outlet />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </UserProvider>
  );
}
