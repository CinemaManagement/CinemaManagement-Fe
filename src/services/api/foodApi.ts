import {FoodType} from "@/types/document";
import request from "../api";

export const cancelFoodBooking = (id: string) => {
  return request({
    url: `/api/bookings/food/${id}/cancel`,
    method: "PATCH",
  }).then((res) => res.data);
};

export const foodApi = {
  getFoods: (type?: FoodType) => {
    return request({
      url: "/api/foods",
      method: "GET",
      params: {type},
    });
  },
  createFood: (data: any) => {
    return request({
      url: "/api/foods",
      method: "POST",
      data,
    });
  },
  updateFood: (id: string, data: any) => {
    return request({
      url: `/api/foods/${id}`,
      method: "PUT",
      data,
    });
  },
  deleteFood: (id: string, hard: boolean = false) => {
    return request({
      url: `/api/foods/${id}`,
      method: "DELETE",
      params: {hard: hard ? "true" : "false"},
    });
  },
  cancelFoodBooking,
};
