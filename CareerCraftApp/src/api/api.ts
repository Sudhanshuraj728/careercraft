import client from './client';

export const authAPI = {
  login: (email: string, password: string) =>
    client.post('/api/auth/mobile/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    client.post('/api/auth/mobile/register', { name, email, password }),

  googleSignIn: (idToken: string) =>
    client.post('/api/auth/google/mobile', { idToken }),

  getMe: () => client.get('/api/auth/mobile/me'),
};

export const companiesAPI = {
  getAll: (page = 1, limit = 20, q?: string) =>
    client.get('/api/mobile/companies', { params: { page, limit, q } }),

  getBySlug: (slug: string) => client.get(`/api/companies/${slug}`),

  getJobs: (slug: string) => client.get(`/api/companies/${slug}/jobs`),
};

export const resumeAPI = {
  upload: (formData: FormData) =>
    client.post('/api/resumes/mobile-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  analyze: (filename: string, companySlug: string, jobRole?: string, jobDescription?: string) =>
    client.post('/api/resumes/mobile-analyze', { filename, companySlug, jobRole, jobDescription }),
};

export const subscriptionAPI = {
  getStatus: () => client.get('/api/mobile/subscription'),
  getPricing: () => client.get('/api/subscription/pricing'),
};

export const templatesAPI = {
  getAll: (role?: string) => client.get('/api/templates', { params: { role } }),
  getById: (id: string) => client.get(`/api/templates/${id}`),
};

