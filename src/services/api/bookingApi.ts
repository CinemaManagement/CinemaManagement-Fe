import request from "../api";

export const createFoodBooking = (items: {foodId: string; quantity: number}[]) => {
  return request({
    url: "/api/bookings/food",
    method: "POST",
    data: {items},
  }).then((res) => res.data);
};

export const createMovieBooking = (
  showtimeId: string,
  seats: string[],
  movieBookingId?: string,
) => {
  return request({
    url: "/api/bookings/movie",
    method: "POST",
    data: {showtimeId, seats, movieBookingId},
  }).then((res) => res.data);
};

export interface PaymentData {
  method: string;
  transactionId?: string;
  discountCode?: string;
}

export const confirmPayment = (id: string, data: PaymentData) => {
  return request({
    url: `/api/bookings/${id}/pay`,
    method: "POST",
    data,
  }).then((res) => res.data);
};

export const createVnpayPaymentUrl = (id: string, discountCode?: string) => {
  return request({
    url: `/api/bookings/${id}/create-vnpay-url`,
    method: "POST",
    data: discountCode ? {discountCode} : {},
  }).then((res) => res.data);
};

/** Combined checkout: creates FoodBooking (optional) + returns VNPay URL in one call */
export const checkoutAndPay = (
  movieBookingId: string,
  foodItems: {foodId: string; quantity: number}[],
  discountCode?: string,
) => {
  return request({
    url: `/api/bookings/${movieBookingId}/checkout`,
    method: "POST",
    data: {foodItems, ...(discountCode && {discountCode})},
  }).then((res) => res.data);
};

export const getBookingHistory = () => {
  return request({
    url: "/api/bookings/history",
    method: "GET",
  }).then((res) => res.data);
};

export const checkIn = (id: string) => {
  return request({
    url: `/api/bookings/${id}/checkin`,
    method: "PATCH",
  }).then((res) => res.data);
};

export const cancelBooking = (id: string) => {
  return request({
    url: `/api/bookings/${id}/cancel`,
    method: "PATCH",
  }).then((res) => res.data);
};

export const addFoodToBooking = (movieBookingId: string, foodBookingId: string) => {
  return request({
    url: "/api/bookings/add-food-order",
    method: "PATCH",
    data: {movieBookingId, foodBookingId},
  }).then((res) => res.data);
};

export const cancelFoodBooking = (id: string) => {
  return request({
    url: `/api/bookings/food/${id}/cancel`,
    method: "PATCH",
  }).then((res) => res.data);
};

export const getBookingDetails = (id: string) => {
  return request({
    url: `/api/bookings/${id}`,
    method: "GET",
  }).then((res) => res.data);
};

export const getAllBookingsHistory = () => {
  return request({
    url: "/api/bookings/all-history",
    method: "GET",
  }).then((res) => res.data);
};

export const getBookingById = (id: string) => {
  return request({
    url: `/api/bookings/${id}`,
    method: "GET",
  }).then((res) => res.data);
};
