import request from '../api';

export const bookingApi = {
  getHistory: () => {
    return request({
      url: '/api/booking/history',
      method: 'GET',
    });
  },
  reserveMovieTickets: (data: Record<string, unknown>) => {
    return request({
      url: '/api/booking/movie',
      method: 'POST',
      data,
    });
  },
  orderFood: (data: Record<string, unknown>) => {
    return request({
      url: '/api/booking/food',
      method: 'POST',
      data,
    });
  },
};
