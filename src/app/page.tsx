import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './login/actions'
import { Activity, LogOut } from 'lucide-react'
import DashboardContent from './components/DashboardContent'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 p-6 md:p-8 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center ring-1 ring-blue-500/30">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Forex AI Agent</h1>
            <p className="text-xs text-slate-400">Institutional Grade Trading</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-sm flex items-center gap-2">
            <span className="text-slate-400">User:</span>
            <span className="text-slate-200 truncate max-w-[150px]">{user.email}</span>
          </div>
          <form action={logout}>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Client-side dashboard content with live data */}
      <DashboardContent userEmail={user.email || ''} />
    </div>
  )
}
