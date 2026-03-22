import request from "../api";
import {FoodType} from "@/types/document";

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
};
