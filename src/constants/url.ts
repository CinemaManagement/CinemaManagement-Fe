const URL = {
  Home: "/",
  Login: "/login",
  NotFound: "*",

  Register: "/register",
  ForgotPassword: "/forgot-password",

  Movies: "/movies",
  MovieAdd: "/movies/add",
  MovieEdit: "/movies/edit/:id",
  MovieDetail: "/movies/:id",
  Showtimes: "/showtimes",
  Food: "/food",
  FoodManagement: "/admin/foods",
  FoodSelection: "/food-selection",
  Booking: "/booking/:showtimeId",
  PaymentMethod: "/payment-method",
  VnpayReturn: "/vnpay-return",
  PaymentSuccess: "/payment-success",
  Profile: "/profile",

  Admin: "/admin",
  AdminMovies: "/admin/movies",
  AdminShowtimes: "/admin/showtimes",
  AdminUsers: "/admin/users",
  AdminOrders: "/admin/orders",
  AdminReports: "/admin/reports",
  AdminRooms: "/admin/rooms",
  AdminRoomAdd: "/admin/rooms/add",
  AdminRoomEdit: "/admin/rooms/edit/:id",
  AdminRoomDetail: "/admin/rooms/:id",
  AllBookings: "/cinema/bookings",
  CheckIn: "/cinema/checkin/:id",
};

export default URL;
