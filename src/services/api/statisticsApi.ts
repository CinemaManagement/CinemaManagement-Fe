import request from '../api';

export const statisticsApi = {
  getDashboardStats: () => {
    return request({
      url: '/api/statistics/dashboard',
      method: 'GET',
    });
  },
};
