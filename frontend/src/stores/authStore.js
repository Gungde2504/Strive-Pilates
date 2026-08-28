import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        localStorage.setItem("auth_token", token)
        set({ user: userData, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem("auth_token")
        set({ user: null, token: null, isAuthenticated: false })
        window.location.href = "/login"
      },

      getDashboardUrl: () => {
        const role = get().user?.role
        const routes = {
          owner: "/owner/dashboard",
          admin: "/admin/dashboard",
          instructor: "/instructor/dashboard",
          member: "/member/dashboard",
        }
        return routes[role] || "/login"
      },
    }),
    {
      name: "strive-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
