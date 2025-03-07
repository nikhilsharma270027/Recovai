"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useAuth } from "context/AuthContext"
import { Logo } from "../assets/Logo"
import { useEffect } from "react"
import FeatureCards from "./featurecards"

interface PlusPatternBackgroundProps {
  plusSize?: number
  plusColor?: string
  backgroundColor?: string
  className?: string
  style?: React.CSSProperties
  fade?: boolean
  [key: string]: any
}

export const BackgroundPlus: React.FC<PlusPatternBackgroundProps> = ({
  plusColor = "#CCE5FF",
  backgroundColor = "transparent",
  plusSize = 60,
  className,
  fade = true,
  style,
  ...props
}) => {
  const encodedPlusColor = encodeURIComponent(plusColor)

  const maskStyle: React.CSSProperties = fade
    ? {
        maskImage: "radial-gradient(circle, white 10%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(circle, white 10%, transparent 90%)",
      }
    : {}

  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${plusSize}' height='${plusSize}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='${encodedPlusColor}' fillOpacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    ...maskStyle,
    ...style,
  }

  return (
    <div className={`absolute inset-0 h-full w-full opacity-50 ${className}`} style={backgroundStyle} {...props}></div>
  )
}

export default function Hero() {
  const { user, login } = useAuth()

  const router = useRouter()

  useEffect(() => {
    if (user) router.push("/")
  }, [user])
  return (
    <div className="relative z-[10] min-h-screen overflow-hidden">
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[45] pointer-events-none">
        <div
          className="h-48 w-[95%] overflow-x-hidden bg-[#3B82F6] bg-opacity-100 md:bg-opacity-70 blur-[400px]"
          style={{ transform: "rotate(-30deg)" }}
        />
      </div>
      <BackgroundPlus />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Left section */}
            <div className="flex items-center space-x-8">
              <div className="inline-flex gap-2 items-center">
                <Logo />
                <span className="text-lg lg:text-xl font-medium bg-clip-text text-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  Recov.ai
                </span>
              </div>
              <nav className="hidden lg:flex items-center space-x-8">
                {/* Products dropdown commented out for now
                <Popover className="relative">
                  ...
                </Popover>
                */}

                <a href="https://docs.supermemory.ai" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Docs
                </a>
              </nav>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-6">
              {/* <div className="hidden sm:flex items-center space-x-6">
                <a
                  href="https://git.new/memory"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <GithubIcon className="h-6 w-6" />
                </a>
                <a
                  href="https://discord.gg/b3BgKWpbtR"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <DiscordIcon className="h-6 w-6" />
                </a>
              </div> */}
              {/* <div className="flex items-center space-x-4" onClick={login}>
                <a
                  // href="/signin"

                  className="[box-shadow:0_-20px_80px_-20px_#CCE5FF_inset] bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-all duration-200 hover:translate-y-[-1px]"
                >
                  Get started
                </a>
              </div> */}
              <div className="flex items-center space-x-6">
                {user ? (
                  // Display user profile when logged in
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.photoURL || "/default-avatar.png"} // Fallback avatar
                      alt={user.displayName || "User"}
                      className="w-10 h-10 rounded-full border"
                    />
                    <span className="text-gray-800 font-medium">{user.displayName || "User"}</span>
                  </div>
                ) : (
                  // Show login button when user is not logged in
                  <div className="flex items-center space-x-4" onClick={login}>
                    <a className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-all duration-200 hover:translate-y-[-1px]">
                      Get started
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 md:pt-40 relative z-[20] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Hero Content */}
            <div className="text-left max-w-xl mx-auto lg:mx-0">
              {/* Announcement Banner */}

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                Your AI-Powered Recovery & Medication Assistant
              </h1>
              <p className="text-xl text-gray-600 mt-6 mb-8 leading-relaxed">
                Personalized care, real-time guidance, better health outcomes.
              </p>
              {/* list of notable features */}
              <ul className="list-none space-y-3 mt-6">
                <li className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span> AI-driven physical therapy with real-time feedback</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Smart medication reminders using OCR & AI</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span> Remote monitoring & personalized care adjustments</span>
                </li>
              </ul>
              <div className="flex flex-col space-y-8 mt-6">
               
              </div>
            </div>
          </div>

          {/* Feature Cards Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
            <FeatureCards />
          </div>

          {/* Integration Tags */}
          <div className="mt-32">
            <div className="text-gray-900 font-medium mb-8 text-center text-lg">Integrate with your favorite tools</div>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Notion",
                "Twitter",
                "Obsidian",
                "Reddit",
                "LinkedIn",
                "Chrome Extension",
                "iOS App",
                "Slack",
              ].map((tool) => (
                <div
                  key={tool}
                  className="bg-white/90 rounded-full px-5 py-2.5 shadow-sm hover:shadow-md hover:bg-white hover:translate-y-[-1px] transition-all duration-200 cursor-pointer"
                >
                  {tool}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

