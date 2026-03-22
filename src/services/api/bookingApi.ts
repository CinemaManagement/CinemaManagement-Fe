import request from "../api";

export const getBookingHistory = () => {
   return request({
      url: "/api/bookings/history",
      method: "GET",
   });
};
