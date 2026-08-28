// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,  // Untuk Sanctum cookie auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000, // 30 detik
})

// ── Request Interceptor ────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Tambah token dari localStorage jika ada
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (!response) {
      // Network error
      return Promise.reject({ message: 'Tidak dapat terhubung ke server. Periksa koneksi internet.' })
    }

    switch (response.status) {
      case 401:
        // Token expired atau tidak valid
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        window.location.href = '/login'
        break

      case 403:
        // Tidak punya akses
        console.error('Forbidden: Anda tidak punya akses ke resource ini.')
        break

      case 422:
        // Validation error — return as-is, handle di komponen
        break

      case 429:
        // Rate limit
        return Promise.reject({
          message: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.',
          status: 429,
        })

      case 500:
        return Promise.reject({
          message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
          status: 500,
        })

      default:
        break
    }

    return Promise.reject(error)
  }
)

// ── Auth endpoints ─────────────────────────────────
export const authApi = {
  login:          (data)    => api.post('/auth/login', data),
  register:       (data)    => api.post('/auth/register', data),
  logout:         ()        => api.post('/auth/logout'),
  me:             ()        => api.get('/auth/me'),
  forgotPassword: (email)   => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)    => api.post('/auth/reset-password', data),
}

// ── Schedule endpoints ─────────────────────────────
export const scheduleApi = {
  getWeekly:  (params) => api.get('/schedules', { params }),
  getToday:   ()       => api.get('/schedules/today'),
  getById:    (id)     => api.get(`/schedules/${id}`),
  // Admin
  create:     (data)   => api.post('/admin/schedules', data),
  update:     (id, d)  => api.put(`/admin/schedules/${id}`, d),
  cancel:     (id, d)  => api.patch(`/admin/schedules/${id}/cancel`, d),
}

// ── Booking endpoints ──────────────────────────────
export const bookingApi = {
  create:      (data)  => api.post('/member/bookings', data),
  getMyList:   (params)=> api.get('/member/bookings', { params }),
  getById:     (id)    => api.get(`/member/bookings/${id}`),
  reschedule:  (id, d) => api.patch(`/member/bookings/${id}/reschedule`, d),
  cancel:      (id, d) => api.patch(`/member/bookings/${id}/cancel`, d),
  // Admin
  adminList:   (params)=> api.get('/admin/bookings', { params }),
  adminConfirm:(id)    => api.patch(`/admin/bookings/${id}/confirm`),
  adminCancel: (id, d) => api.patch(`/admin/bookings/${id}/cancel`, d),
}

// ── Payment endpoints ──────────────────────────────
export const paymentApi = {
  initiate:   (bookingId) => api.post(`/member/payments/${bookingId}/initiate`),
  getStatus:  (bookingId) => api.get(`/member/payments/${bookingId}/status`),
  myHistory:  (params)    => api.get('/member/payments', { params }),
}

// ── Package endpoints ──────────────────────────────
export const packageApi = {
  getPublic:  ()           => api.get('/packages'),
  purchase:   (data)       => api.post('/member/packages/purchase', data),
  myPackages: ()           => api.get('/member/packages'),
  applyVoucher:(code, pid) => api.post('/vouchers/apply', { code, package_id: pid }),
}

// ── Class endpoints ────────────────────────────────
export const classApi = {
  getPublic:  (params) => api.get('/classes', { params }),
  getById:    (id)     => api.get(`/classes/${id}`),
  // Admin
  adminList:  (params) => api.get('/admin/classes', { params }),
  create:     (data)   => api.post('/admin/classes', data),
  update:     (id, d)  => api.put(`/admin/classes/${id}`, d),
  toggle:     (id)     => api.patch(`/admin/classes/${id}/toggle`),
}

// ── CMS endpoints (Admin) ──────────────────────────
export const cmsApi = {
  banners:      { list: ()     => api.get('/admin/content/banners'),
                  create: (d)  => api.post('/admin/content/banners', d),
                  update: (id,d)=> api.put(`/admin/content/banners/${id}`, d),
                  delete: (id) => api.delete(`/admin/content/banners/${id}`) },

  pricing:      { list: ()     => api.get('/admin/content/pricing'),
                  create: (d)  => api.post('/admin/content/pricing', d),
                  update: (id,d)=> api.put(`/admin/content/pricing/${id}`, d),
                  delete: (id) => api.delete(`/admin/content/pricing/${id}`) },

  testimonials: { list: ()     => api.get('/admin/content/testimonials'),
                  create: (d)  => api.post('/admin/content/testimonials', d),
                  update: (id,d)=> api.put(`/admin/content/testimonials/${id}`, d),
                  delete: (id) => api.delete(`/admin/content/testimonials/${id}`) },

  gallery:      { list: ()     => api.get('/admin/content/gallery'),
                  upload: (d)  => api.post('/admin/content/gallery', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
                  delete: (id) => api.delete(`/admin/content/gallery/${id}`) },

  faqs:         { list: ()     => api.get('/admin/content/faqs'),
                  create: (d)  => api.post('/admin/content/faqs', d),
                  update: (id,d)=> api.put(`/admin/content/faqs/${id}`, d),
                  delete: (id) => api.delete(`/admin/content/faqs/${id}`) },
}

// ── Dashboard / Reports ────────────────────────────
export const reportApi = {
  ownerDashboard:  ()       => api.get('/owner/dashboard'),
  ownerFinance:    (params) => api.get('/owner/finance', { params }),
  ownerCompare:    (params) => api.get('/owner/finance/compare', { params }),
  adminDashboard:  ()       => api.get('/admin/dashboard'),
  adminDaily:      (params) => api.get('/admin/reports/daily', { params }),
  instrDashboard:  ()       => api.get('/instructor/dashboard'),
  instrReports:    (params) => api.get('/instructor/reports', { params }),
  memberDashboard: ()       => api.get('/member/dashboard'),
}

export default api
