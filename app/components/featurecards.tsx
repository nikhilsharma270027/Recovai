"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Activity, FileScanIcon as FileAnalytics, Clock, ArrowRight } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  hoverColor: string
  route: string
  imageUrl: string
}

export function FeatureCard({ title, description, icon, color, hoverColor, route, imageUrl }: FeatureCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl bg-white shadow-lg cursor-pointer group"
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => router.push(route)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 z-0 opacity-20 transition-opacity duration-300 group-hover:opacity-30">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
        <div className={`absolute inset-0 ${color} opacity-80`}></div>
      </div>

      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className={`p-3 rounded-lg ${color} w-fit mb-4`}>{icon}</div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>

        <motion.div
          className={`flex items-center font-medium ${hoverColor} mt-auto`}
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Learn more <ArrowRight className="ml-2 h-4 w-4" />
        </motion.div>
      </div>

      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-1 ${hoverColor}`}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default function FeatureCards() {
  const features = [
    {
      title: "Physical Therapy Assistant",
      description: "AI-driven exercises and real-time feedback for your recovery journey.",
      icon: <Activity className="h-6 w-6 text-white" />,
      color: "bg-blue-100",
      hoverColor: "text-blue-600",
      route: "/therapy",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      title: "Report Analysis",
      description: "Intelligent analysis of your medical reports with personalized insights.",
      icon: <FileAnalytics className="h-6 w-6 text-white" />,
      color: "bg-purple-100",
      hoverColor: "text-purple-600",
      route: "/reportAnalysis",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      title: "Medicine Reminders",
      description: "Smart medication tracking and timely reminders for better adherence.",
      icon: <Clock className="h-6 w-6 text-white" />,
      color: "bg-green-100",
      hoverColor: "text-green-600",
      route: "/reminders",
      imageUrl: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  )
}

