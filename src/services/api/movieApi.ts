import request from '../api';

export const movieApi = {
  getMovies: () => {
    return request({
      url: '/api/movies',
      method: 'GET',
    });
  },
  createMovie: (data: Record<string, unknown>) => {
    return request({
      url: '/api/movies',
      method: 'POST',
      data,
    });
  },
  getMovieById: (id: string) => {
    return request({
      url: `/api/movies/${id}`,
      method: 'GET',
    });
  },
  updateMovie: (id: string, data: Record<string, unknown>) => {
    return request({
      url: `/api/movies/${id}`,
      method: 'PUT',
      data,
    });
  },
  deleteMovie: (id: string) => {
    return request({
      url: `/api/movies/${id}`,
      method: 'DELETE',
    });
  },
};
