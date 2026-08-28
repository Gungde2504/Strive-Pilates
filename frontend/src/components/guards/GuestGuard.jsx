import { Navigate, useLocation } from "react-router-dom"
import useAuthStore from "../../stores/authStore"

export default function GuestGuard({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (isAuthenticated) {
    const params = new URLSearchParams(location.search)
    const redirect = params.get("redirect")
    if (redirect && user?.role === "member") {
      return <Navigate to={redirect} replace />
    }
    const routes = {
      owner:      "/owner/dashboard",
      admin:      "/admin/dashboard",
      instructor: "/instructor/dashboard",
      member:     "/member/dashboard",
    }
    return <Navigate to={routes[user?.role] || "/member/dashboard"} replace />
  }

  return children
}