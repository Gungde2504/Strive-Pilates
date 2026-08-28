import { Navigate } from "react-router-dom"
import useAuthStore from "../../stores/authStore"

export default function AuthGuard({ children, role }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role && user?.role !== role) {
    // Redirect ke dashboard sesuai role
    const routes = {
      owner:      "/owner/dashboard",
      admin:      "/admin/dashboard",
      instructor: "/instructor/dashboard",
      member:     "/member/dashboard",
    }
    return <Navigate to={routes[user?.role] || "/"} replace />
  }

  return children
}
