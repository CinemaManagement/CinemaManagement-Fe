import request from '../api';

export const showtimeApi = {
  createShowtime: (data: Record<string, unknown>) => {
    return request({
      url: '/api/showtimes',
      method: 'POST',
      data,
    });
  },
  getShowtimesByMovie: (movieId: string) => {
    return request({
      url: `/api/showtimes/movie/${movieId}`,
      method: 'GET',
    });
  },
};
