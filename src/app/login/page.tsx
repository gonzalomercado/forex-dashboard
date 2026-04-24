import { login, signup } from './actions'
import { Activity } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] text-slate-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
        
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2 ring-1 ring-blue-500/30">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Forex AI Agent</h1>
          <p className="text-sm text-slate-400">Institutional Grade Trading</p>
        </div>

        <form className="space-y-6 flex flex-col mt-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1 block" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="trader@fund.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1 block" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {message && (
            <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center">
              {message}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              formAction={login}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Sign In
            </button>
            <button
              formAction={signup}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Sign Up
            </button>
          </div>
        </form>
        
      </div>
    </div>
  )
}
