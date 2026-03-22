import request from "../api";

export const getFoods = () => {
  return request({
    url: "/api/foods",
    method: "GET",
  }).then((res) => res.data);
};

export const cancelFoodBooking = (id: string) => {
  return request({
    url: `/api/bookings/food/${id}/cancel`,
    method: "PATCH",
  }).then((res) => res.data);
};

export const foodApi = {
  getFoods,
  cancelFoodBooking
};
