import { Outlet } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "../components/public/Navbar"
import Footer from "../components/public/Footer"

export default function PublicLayout() {
  useEffect(() => {
    document.body.style.backgroundColor = "#F5F0EA"
    return () => { document.body.style.backgroundColor = "" }
  }, [])
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
