import {Route, Routes} from "react-router-dom";
import {Suspense, lazy} from "react";

import URL from "@/constants/url";
import type {ItemRouteType} from "@/types/routes/router.type";
import DefaultLayout from "./DefaultLayout";
import ProtectedRoute from "./ProtectedRoute";
import {Loader2} from "lucide-react";
import {UserRole} from "@/types/document";

// Lazy load all pages
const Login = lazy(() => import("@/pages/login"));
const NotFound = lazy(() => import("@/pages/404"));
const MovieDetail = lazy(() => import("@/pages/movies/MovieDetail"));
const Movies = lazy(() => import("@/pages/movies"));
const Register = lazy(() => import("@/pages/register"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const Home = lazy(() => import("@/pages/home"));
const MovieForm = lazy(() => import("@/pages/movies/MovieForm"));
const SeatSelection = lazy(() => import("@/pages/booking/SeatSelection"));
const FoodSelection = lazy(() => import("@/pages/booking/FoodSelection"));
const FoodMenu = lazy(() => import("@/pages/food"));
const Profile = lazy(() => import("@/pages/profile"));
const BookingSuccess = lazy(() => import("@/pages/booking/Success"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Showtimes = lazy(() => import("@/pages/showtimes"));
const FoodManagement = lazy(() => import("@/pages/foods/FoodManagement"));
const RoomManagement = lazy(() => import("@/pages/rooms/RoomManagement"));
const RoomForm = lazy(() => import("@/pages/rooms/RoomForm"));
const RoomDetail = lazy(() => import("@/pages/rooms/RoomDetail"));
const PaymentMethod = lazy(() => import("@/pages/booking/PaymentMethod"));
const VnpayReturn = lazy(() => import("@/pages/booking/VnpayReturn"));
const AllBookings = lazy(() => import("@/pages/cinema/AllBookings"));
const CheckInConfirm = lazy(() => import("@/pages/cinema/CheckIn"));

export const menuRouterItems: ItemRouteType[] = [
  {
    key: URL.Home,
    components: <Home />,
    layout: "default",
    title: "Home",
    isMenu: true,
  },
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
    key: URL.AdminRooms,
    components: <RoomManagement />,
    roles: [UserRole.MANAGER],
    layout: "default",
    title: "Rooms",
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
    key: URL.AllBookings,
    components: <AllBookings />,
    roles: [UserRole.CINEMA],
    layout: "default",
    title: "All Bookings",
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
  {key: URL.Login, components: <Login />, layout: ""},
  {key: URL.Register, components: <Register />, layout: ""},
  {key: URL.ForgotPassword, components: <ForgotPassword />, layout: ""},
  {key: URL.NotFound, components: <NotFound />, layout: ""},
  {key: URL.Home, components: <Home />, layout: "default"},
];

const detailRouterItems: ItemRouteType[] = [
  {key: URL.MovieDetail, components: <MovieDetail />, layout: "default"},
  {key: URL.MovieAdd, components: <MovieForm />, layout: "default"},
  {key: URL.MovieEdit, components: <MovieForm />, layout: "default"},
  {key: URL.Booking, components: <SeatSelection />, layout: "default", roles: [UserRole.CUSTOMER]},
  {key: URL.FoodSelection, components: <FoodSelection />, layout: "default", roles: [UserRole.CUSTOMER]},
  {key: URL.Profile, components: <Profile />, layout: "default", roles: [UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN]},
  {key: URL.PaymentSuccess, components: <BookingSuccess />, layout: "default", roles: [UserRole.CUSTOMER]},
  {key: URL.PaymentMethod, components: <PaymentMethod />, layout: "default"},
  {key: URL.VnpayReturn, components: <VnpayReturn />, layout: "default"},
  {key: URL.AdminRoomAdd, components: <RoomForm />, layout: "default"},
  {key: URL.AdminRoomEdit, components: <RoomForm />, layout: "default"},
  {key: URL.AdminRoomDetail, components: <RoomDetail />, layout: "default"},
  {key: URL.CheckIn, components: <CheckInConfirm />, layout: "default"},
];

const allRouters = [...menuRouterItems, ...publicRouterItems, ...detailRouterItems];

export default function Routers() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <Routes>
        {allRouters.map((item) => {
          let element = item.components;

          // Wrap with ProtectedRoute only if roles are specified
          if (item.roles && item.roles.length > 0) {
            element = <ProtectedRoute>{element}</ProtectedRoute>;
          }

          if (item.layout === "default") {
            element = <DefaultLayout>{element}</DefaultLayout>;
          }

          return <Route key={item.key} path={item.key} element={element} />;
        })}
      </Routes>
    </Suspense>
  );
}
