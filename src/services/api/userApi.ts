import request from '../api';

export const userApi = {
  getProfile: () => {
    return request({
      url: '/api/users/me',
      method: 'GET',
    });
  },
  register: (data: Record<string, unknown>) => {
    return request({
      url: '/auth/register',
      method: 'POST',
      data,
    });
  },
  logout: () => {
    return request({
      url: '/auth/logout',
      method: 'POST',
    });
  },
  forgotPassword: (data: Record<string, unknown>) => {
    return request({
      url: '/auth/forgot-password',
      method: 'POST',
      data,
    });
  },
};
