import { Navigate } from "react-router-dom"
import useAuthStore from "../../stores/authStore"

export default function RoleGuard({ children, role }) {
  const { user } = useAuthStore()
  if (!user || user.role !== role) {
    return <Navigate to="/login" replace />
  }
  return children
}
