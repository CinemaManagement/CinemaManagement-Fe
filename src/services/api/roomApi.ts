import request from '../api';
// No imports needed from types if using Record

export const roomApi = {
  getRooms: () => {
    return request({
      url: '/api/rooms',
      method: 'GET',
    }).then(res => res.data);
  },
  getRoomById: (id: string) => {
    return request({
      url: `/api/rooms/${id}`,
      method: 'GET',
    }).then(res => res.data);
  },
  updateRoom: (id: string, data: { roomName: string; seats: Record<string, string[]> }) => {
    return request({
      url: `/api/rooms/${id}`,
      method: "PUT",
      data,
    }).then((res) => res.data);
  },
  createRoom: (data: { roomName: string; seats: Record<string, string[]> }) => {
    return request({
      url: '/api/rooms',
      method: 'POST',
      data,
    }).then(res => res.data);
  },
  updateRoomSeats: (id: string, status: Record<string, unknown>) => {
    return request({
      url: `/api/rooms/${id}/seats`,
      method: 'PATCH',
      data: { status },
    }).then(res => res.data);
  },
  updateRoomStatus: (id: string, status: string) => {
    return request({
      url: `/api/rooms/${id}/status`,
      method: 'PATCH',
      data: { status },
    }).then(res => res.data);
  },
};
