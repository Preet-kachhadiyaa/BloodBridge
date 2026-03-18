import React from 'react'

/**
 * Full-screen page transition loader.
 * Used for login (min 2s) and logout (0.2s) transitions.
 */
export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 animate-fadeIn">
      {/* Glow blob */}
      <div className="absolute w-72 h-72 bg-blood-800/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      {/* Spinner */}
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-4 border-white/5" />
        {/* Spinning arc */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-blood-500 border-r-blood-600 animate-spin" />
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl select-none">🩸</span>
        </div>
      </div>

      {/* Brand */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg font-bold text-white">Blood</span>
        <span className="text-lg font-bold text-blood-500">Bridge</span>
      </div>

      {/* Message */}
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>

      {/* Dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 bg-blood-500 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
