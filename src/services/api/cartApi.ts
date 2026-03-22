import request from "../api";

export const cartApi = {
  getCart: () => {
    return request({
      url: "/api/cart",
      method: "GET",
    });
  },
  addToCart: (data: { foodId: string; quantity: number }) => {
    return request({
      url: "/api/cart/add",
      method: "POST",
      data,
    });
  },
  updateCart: (data: { foodId: string; quantity: number }) => {
    return request({
      url: "/api/cart/update",
      method: "PUT",
      data,
    });
  },
  removeFromCart: (foodId: string) => {
    return request({
      url: `/api/cart/remove/${foodId}`,
      method: "DELETE",
    });
  },
  clearCart: () => {
    return request({
      url: "/api/cart/clear",
      method: "DELETE",
    });
  },
};
