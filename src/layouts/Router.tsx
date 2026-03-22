/* eslint-disable react-refresh/only-export-components */
import { Route, Routes } from "react-router-dom";

import URL from "@/constants/url";
import type { ItemRouteType } from "@/types/routes/router.type";
import DefaultLayout from "./DefaultLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";

import Login from "@/pages/login";
import NotFound from "@/pages/404";
import MovieDetail from "@/pages/movies/MovieDetail";
import Movies from "@/pages/movies";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import Home from "@/pages/home";
import MovieForm from "@/pages/movies/MovieForm";
import SeatSelection from "@/pages/booking/SeatSelection";
import FoodSelection from "@/pages/booking/FoodSelection";
import FoodMenu from "@/pages/food";
import Profile from "@/pages/profile";
import BookingSuccess from "@/pages/booking/Success";
import AdminDashboard from "@/pages/admin/Dashboard";
import Showtimes from "@/pages/showtimes";
import { UserRole } from "@/types/document";
import FoodManagement from "@/pages/foods/FoodManagement";

export const menuRouterItems: ItemRouteType[] = [
  {
    key: URL.Movies,
    components: <Movies />,
    layout: "default",
    title: "Movies",
    isMenu: true,
  },
  {
    key: URL.Showtimes,
    components: <Showtimes />,
    layout: "default",
    title: "Showtimes",
    isMenu: true,
  },
  {
    key: URL.Food,
    components: <FoodMenu />,
    roles: [UserRole.CUSTOMER],
    layout: "default",
    title: "Food & Drinks",
    isMenu: true,
  },
  {
    key: URL.FoodManagement,
    components: <FoodManagement />,
    roles: [UserRole.MANAGER],
    layout: "default",
    title: "Food & Drinks",
    isMenu: true,
  },
  {
    key: URL.Admin,
    components: <AdminDashboard />,
    layout: "default",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    title: "Dashboard",
    isMenu: true,
  },
];

const publicRouterItems: ItemRouteType[] = [
  { key: URL.Login, components: <Login />, layout: "" },
  { key: URL.Register, components: <Register />, layout: "" },
  { key: URL.ForgotPassword, components: <ForgotPassword />, layout: "" },
  { key: URL.NotFound, components: <NotFound />, layout: "" },
  { key: URL.Home, components: <Home />, layout: "default" },
];

const detailRouterItems: ItemRouteType[] = [
  { key: URL.MovieDetail, components: <MovieDetail />, layout: "default" },
  { key: URL.MovieAdd, components: <MovieForm />, layout: "default" },
  { key: URL.MovieEdit, components: <MovieForm />, layout: "default" },
  { key: URL.Booking, components: <SeatSelection />, layout: "default" },
  { key: URL.FoodSelection, components: <FoodSelection />, layout: "default" },
  { key: URL.Profile, components: <Profile />, layout: "default" },
  { key: URL.PaymentSuccess, components: <BookingSuccess />, layout: "default" },
];

const allRouters = [...menuRouterItems, ...publicRouterItems, ...detailRouterItems];

export default function Routers() {
  return (
    <Routes>
      {allRouters.map((item) => {
        let element = item.components;
        if (item.layout === "default") {
          element = (
            <DefaultLayout>
              <ProtectedRoute>{element}</ProtectedRoute>
            </DefaultLayout>
          );
        }

        return <Route key={item.key} path={item.key} element={element} />;
      })}
    </Routes>
  );
}
