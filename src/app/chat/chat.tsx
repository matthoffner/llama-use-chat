'use client'

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'

export function Chat({ handler }: { handler: any }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: handler,
  })

  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const matchDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(matchDarkMode.matches)

    // Listener for changes in color scheme
    const darkModeListener = (e) => setIsDarkMode(e.matches)
    matchDarkMode.addEventListener('change', darkModeListener)

    return () => matchDarkMode.removeEventListener('change', darkModeListener)
  }, [])

  return (
    <div
      className={`flex flex-col w-full max-w-md mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}
      style={{
        height: '100vh',
        paddingBottom: '4rem',
        background: `linear-gradient(to bottom, transparent, rgba(var(--background-end-rgb), 1)) rgba(var(--background-start-rgb), 1)`,
      }}
    >
      <ul
        className="overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 5rem)' }}
      >
        {messages.map((m, index) => (
          <li
            key={index}
            className={`p-2 my-2 rounded-lg ${m.role === 'user'
              ? (isDarkMode ? 'bg-blue-900' : 'bg-blue-100') +
              ' ml-4 self-start'
              : (isDarkMode ? 'bg-green-900' : 'bg-green-100') +
              ' mr-4 self-end'
              }`}
          >
            <span className="font-semibold">
              {m.role === 'user' ? 'You: ' : 'AI: '}
            </span>
            <span>{m.content || m.ui}</span>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className={`fixed bottom-0 w-full max-w-md px-3 pb-3 pt-2 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} border-t border-gray-200`}
        style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}
      >
        <input
          className={`p-2 w-full ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'border border-gray-300'} rounded shadow-sm`}
          placeholder="Ask me anything..."
          value={input}
          onChange={handleInputChange}
          autoFocus
        />
      </form>
    </div>
  )
}
