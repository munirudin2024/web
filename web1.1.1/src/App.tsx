// App.tsx
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import './App.css' // opsional – kalau mau tweak sendiri

function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  const login = () => supabase.auth.signInWithOAuth({ provider: 'github' })
  const logout = () => supabase.auth.signOut()

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-sm mx-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl shadow-xl p-8 ring-1 ring-black/5">
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-20 h-20 rounded-full shadow-md"
            />
            <h1 className="text-2xl font-semibold">Hi, {user.user_metadata.user_name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <button
              onClick={logout}
              className="w-full mt-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium py-2.5 rounded-lg hover:from-rose-600 hover:to-red-700 active:scale-[0.98] transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 grid place-items-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">React + Supabase</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to continue</p>
            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-gray-800 to-black dark:from-white dark:to-gray-200 text-white dark:text-gray-900 font-medium py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Login with GitHub
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default App