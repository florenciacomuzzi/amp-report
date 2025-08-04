import api from './api';

// Keep using the REST API for auth for now since it's already working
// and converting Redux auth to TRPC requires more complex refactoring
const authService = {
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },

  register: (email: string, password: string, firstName: string, lastName: string) => {
    return api.post('/auth/register', { email, password, firstName, lastName });
  },

  logout: () => {
    return api.post('/auth/logout');
  },

  getCurrentUser: () => {
    return api.get('/auth/me');
  },
};

export default authService;