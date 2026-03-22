import request from '../api';

export const showtimeApi = {
  getAllShowtimes: () => {
    return request({
      url: '/api/showtimes',
      method: 'GET',
    });
  },
  getShowtimesByMovie: (movieId: string) => {
    return request({
      url: `/api/showtimes/movie/${movieId}`,
      method: 'GET',
    });
  },
};
