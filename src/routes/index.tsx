import {Route, Routes} from "react-router-dom";

import URL from "@/constants/url";

import ProtectedRoute from "@/routes/ProtectedRoute";
import {MainLayout} from "@/layouts/MainLayout";

import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import Home from "@/pages/home";
import MovieDetail from "@/pages/movies/MovieDetail";
import Movies from "@/pages/movies";
import MovieForm from "@/pages/movies/MovieForm";
import SeatSelection from "@/pages/booking/SeatSelection";
import FoodSelection from "@/pages/booking/FoodSelection";
import FoodMenu from "@/pages/food";
import Profile from "@/pages/profile";
import BookingSuccess from "@/pages/booking/Success";
import AdminDashboard from "@/pages/admin/Dashboard";
import FoodManagement from "@/pages/foods/FoodManagement";

const Router = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={URL.Home} element={<Home />} />
        <Route path={URL.Login} element={<Login />} />
        <Route path={URL.Register} element={<Register />} />
        <Route path={URL.ForgotPassword} element={<ForgotPassword />} />
        <Route path={URL.MovieDetail} element={<MovieDetail />} />
        <Route path={URL.Booking} element={<SeatSelection />} />
        <Route path="/food-selection" element={<FoodSelection />} />
        <Route path={URL.Profile} element={<Profile />} />
        <Route path="/payment-success" element={<BookingSuccess />} />
        {/* Placeholder for other routes */}
        <Route path={URL.Movies} element={<Movies />} />
        <Route path="/movies/add" element={<MovieForm />} />
        <Route path="/movies/edit/:id" element={<MovieForm />} />
        <Route
          path={URL.Showtimes}
          element={<div className="p-20 text-center text-2xl">Showtimes coming soon...</div>}
        />
        <Route path={URL.Food} element={<FoodMenu />} />
        <Route path={URL.Food} element={<FoodManagement />} />
      </Route>

      {/* Admin routes */}
      <Route
        path={URL.Admin}
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default Router;
