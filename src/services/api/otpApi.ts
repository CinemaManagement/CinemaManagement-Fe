import request from '../api';

export const otpApi = {
  sendOtp: (data: { email: string }) => {
    return request({
      url: '/otp/send',
      method: 'POST',
      data,
    });
  },
  verifyOtp: (data: { email: string; otp: string }) => {
    return request({
      url: '/otp/verify',
      method: 'POST',
      data,
    });
  },
};
