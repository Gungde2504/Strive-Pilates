import { useState } from "react"

export default function useHover() {
  const [hovered, setHovered] = useState(false)
  return [hovered, {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }]
}