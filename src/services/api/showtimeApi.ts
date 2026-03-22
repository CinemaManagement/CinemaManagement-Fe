import request from "../api";

export const showtimeApi = {
  createShowtime: (data: Record<string, unknown>) => {
    return request({
      url: "/api/showtimes",
      method: "POST",
      data,
    });
  },
  getAllShowtimes: () => {
    return request({
      url: "/api/showtimes",
      method: "GET",
    });
  },
  getShowtimesByMovie: (movieId: string) => {
    return request({
      url: `/api/showtimes/movie/${movieId}`,
      method: "GET",
    });
  },

  getShowtimeById(showtimeId: string) {
    return request({
      url: `/api/showtimes/${showtimeId}`,
      method: "GET",
    });
  },
};
