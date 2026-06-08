'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Navbar({ user, onLogout, showBack, onBack, isCoach }) {
  return (
    <header className="no-print sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              New Upload
            </button>
          )}
          <Image
            src="https://maverickshopowners.s3.us-east-1.amazonaws.com/CPR_logo_transparent_full.png"
            alt="CPR Analyzer"
            width={110}
            height={38}
            priority
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="flex items-center gap-3">
          {isCoach && (
            <Link
              href="/admin"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Admin
            </Link>
          )}
          <span className="hidden sm:block text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={onLogout}
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
