import request from '../api';

export const authApi = {
  login: (data: Record<string, unknown>) => {
    return request({
      url: '/auth/login',
      method: 'POST',
      data,
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
  resetPassword: (data: Record<string, unknown>) => {
    return request({
      url: '/auth/reset-password',
      method: 'POST',
      data,
    });
  },
  changePassword: (data: Record<string, unknown>) => {
    return request({
      url: '/auth/change-pass',
      method: 'POST',
      data,
    });
  },
};
