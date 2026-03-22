import request from "../api";

export const cinemaRoomApi = {
  getRooms: () => {
    return request({
      url: "/api/rooms",
      method: "GET",
    });
  },
};
