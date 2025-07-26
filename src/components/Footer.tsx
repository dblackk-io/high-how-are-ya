'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} High How Are Ya. Anonymous thought sharing.
          </div>
          
          <div className="flex space-x-6 text-sm">
            <Link 
              href="/terms" 
              className="text-gray-400 hover:text-[#ff00cc] transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-400 hover:text-[#ff00cc] transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/exchange/feed?feedback=true" 
              className="text-gray-400 hover:text-[#ff00cc] transition-colors"
            >
              Feedback
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 