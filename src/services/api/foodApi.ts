import request from '../api';

export const foodApi = {
  getFoods: () => {
    return request({
      url: '/api/foods',
      method: 'GET',
    });
  },
};
