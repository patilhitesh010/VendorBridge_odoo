"use client"

import { cn } from "@/lib/utils"

interface VTSRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function VTSRing({ 
  score, 
  size = 60, 
  strokeWidth = 5,
  className 
}: VTSRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 75) return "stroke-green-500"
    if (score >= 50) return "stroke-amber-500"
    return "stroke-red-500"
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500 ease-in-out", getColor(score))}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
        {Math.round(score)}
      </div>
    </div>
  )
}
