// FORZAR MODO CLARO
//document.documentElement.classList.remove("dark");

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "react-hot-toast";
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'
import TableMovies from './components/Movie/TableMovies'
import { ListMovies } from './components/Movie/ListMovies'
import { DetailMovie } from './components/Movie/DetailMovie'

/////nuevo de cris de usuario
import UserList from "@/components/User/UserList";
import UserDetail from "@/components/User/UserDetail";
import Login from "@/components/User/Login";
import Register from "@/components/User/Register";
import UserUpdate from "@/components/User/UserUpdate";

//Jose perfil del usuario xd
import MiPerfil from "@/components/User/MiPerfil";

/////nuevo de cris de funko
import FunkoList from "@/components/Funko/FunkoList";
import FunkoCreate from "@/components/Funko/FunkoCreate";
import FunkoUpdate from "@/components/Funko/FunkoUpdate";
import FunkoDetail from "@/components/Funko/FunkoDetail";
import MantenimientoFunko from "@/components/Funko/MantenimientoFunko";

//import subasta
import { SubastaCatalogo } from "@/components/subasta/SubastaCatalogo";
import { SubastaVista } from "@/components/subasta/SubastaVista";

//import historial de pujas 
import { HistorialPujas } from "@/components/pujas/HistorialPujas";

//import historia de pujas del usuario
import { MisPujas } from "@/components/pujas/MisPujas";

//import mantenimiento subasta
import { MantenimientoSubasta } from "@/components/subasta/MantenimientoSubasta";

//Reporte
import { ReporteSubastasEstado } from "@/components/reportes/ReporteSubastasEstado";

// auth
import RoleRoute from "@/components/Auth/RoleRoute";

const rutas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Ruta principal
      { index: true, element: <Home /> },

      // Ruta comodín (404)
      { path: "*", element: <PageNotFound /> },

      // Rutas componentes ejemplo
      { path: "movie/table", element: <TableMovies /> },
      { path: "movie", element: <ListMovies /> },
      { path: "movie/detail/:id", element: <DetailMovie /> },

      // Rutas de usuario
      {
        path: "users",
        element: (
          <RoleRoute requiredRoles={["Administrador"]}>
            <UserList />
          </RoleRoute>
        ),
      },
      {
        path: "users/:id",
        element: (
          <RoleRoute requiredRoles={["Administrador"]}>
            <UserDetail />
          </RoleRoute>
        ),
      },
      {
        path: "users/update/:id",
        element: (
          <RoleRoute requiredRoles={["Administrador"]}>
            <UserUpdate />
          </RoleRoute>
        ),
      },
      {
        path: "mi-perfil",
        element: (
          <RoleRoute requiredRoles={["Administrador"]}>
            <MiPerfil />
          </RoleRoute>
        ),
      },

      // Rutas de funko
      { path: "funkos", element: <FunkoList /> },
      {
        path: "funkos/create",
        element: (
          <RoleRoute requiredRoles={["Vendedor", "Administrador"]}>
            <FunkoCreate />
          </RoleRoute>
        ),
      },
      {
        path: "funkos/update/:id",
        element: (
          <RoleRoute requiredRoles={["Vendedor", "Administrador"]}>
            <FunkoUpdate />
          </RoleRoute>
        ),
      },
      {
        path: "/funkos",
        element: <MantenimientoFunko />,
      },
      { path: "funkos/:id", element: <FunkoDetail /> },

      // Rutas login
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      // Ruta reporte de subastas por estado
      {
        path: "reportes/subastas-estado",
        element: (
          <RoleRoute requiredRoles={["Administrador"]}>
            <ReporteSubastasEstado />
          </RoleRoute>
        ),
      },

      // Rutas subastas
      { path: "subastas", element: <SubastaCatalogo /> },
      { path: "subastas/:id", element: <SubastaVista /> },
      { path: "subastas/:id/pujas", element: <HistorialPujas /> },

      // Ruta historial de pujas del usuario
      {
        path: "mis-pujas",
        element: (
          <RoleRoute requiredRoles={["Comprador"]}>
            <MisPujas />
          </RoleRoute>
        ),
      },

      {
        path: "mantenimiento-subastas",
        element: (
          <RoleRoute requiredRoles={["Vendedor", "Administrador"]}>
            <MantenimientoSubasta />
          </RoleRoute>
        ),
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div>
      <RouterProvider router={rutas} />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "12px 14px",
          },
        }}
      />
    </div>
  </StrictMode>
);