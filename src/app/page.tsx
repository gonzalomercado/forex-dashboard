import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './login/actions'
import { Activity, LogOut, ShieldAlert, BarChart3, TrendingUp, History } from 'lucide-react'

export const revalidate = 0 // Disable caching, dynamic data

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch {
    return ''
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch data with error handling
  let status: any = {}
  let signals: any[] = []
  let trades: any[] = []

  try {
    const { data: statusData } = await supabase.from('agent_status').select('data').eq('id', 1).single()
    status = statusData?.data || {}
  } catch (e) {
    console.error('Error fetching status:', e)
  }

  try {
    const { data } = await supabase.from('agent_signals').select('*').order('created_at', { ascending: false })
    signals = data || []
  } catch (e) {
    console.error('Error fetching signals:', e)
  }

  try {
    const { data } = await supabase.from('trade_history').select('*').order('exit_time', { ascending: false }).limit(20)
    trades = data || []
  } catch (e) {
    console.error('Error fetching trades:', e)
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
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  {status.running ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  )}
                </span>
                <span className={status.running ? "text-emerald-400" : "text-rose-400"}>
                  {status.running ? "SYSTEM ACTIVE" : "OFFLINE"}
                </span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Acc: {status.account || 'N/A'}</span>
            </div>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Signals & Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard title="Open Positions" value={status.open_positions ?? 0} icon={Activity} />
            <MetricCard title="Daily Trades" value={status.daily_trades ?? 0} icon={BarChart3} />
            <MetricCard title="Losing Streak" value={status.losing_streak ?? 0} icon={TrendingUp} alert={(status.losing_streak ?? 0) >= 3} />
            <MetricCard title="Risk Exposure" value={`${(status.portfolio_risk?.total_risk_pct ?? 0).toFixed(1)}%`} icon={ShieldAlert} />
          </div>

          {/* Active Signals */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Live Smart Picks ({signals.length})
            </h2>
            
            {signals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map((signal) => (
                  <div key={signal.id} className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/60 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            signal.action === 'LONG' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                   : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {signal.action}
                          </span>
                          <span className="text-sm font-semibold text-white tracking-wide">{signal.pair}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">{signal.strategy}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Alpha Score</div>
                        <div className="font-mono text-lg font-bold text-amber-400">α {signal.alpha_score}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-900/50 rounded-lg p-2 border border-slate-800/50">
                      <div>
                        <div className="text-[10px] text-slate-500 mb-0.5">Entry</div>
                        <div className="font-mono text-sm">{signal.entry}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 mb-0.5">SL</div>
                        <div className="font-mono text-sm text-rose-400">{signal.sl}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 mb-0.5">TP</div>
                        <div className="font-mono text-sm text-emerald-400">{signal.tp}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500">MC Robust</span>
                          <span className="font-medium text-slate-300">{signal.mc_robustness ?? '-'}%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500">ML Prob</span>
                          <span className="font-medium text-slate-300">{signal.ml_probability ?? '-'}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                <ShieldAlert className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No valid signals passed MC filters</p>
                <p className="text-xs mt-1">Agent is protecting capital</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Trade History */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Recent Trades
          </h2>
          
          <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
            {trades.length > 0 ? (
              <div className="space-y-3">
                {trades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${trade.action === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="text-sm font-semibold text-slate-200">{trade.pair}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          trade.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 
                          trade.result === 'LOSS' ? 'bg-rose-500/10 text-rose-400' : 
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {trade.result}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">{trade.strategy}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-mono text-sm font-bold ${
                        (trade.profit_pips ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {(trade.profit_pips ?? 0) > 0 ? '+' : ''}{trade.profit_pips ?? 0} pips
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {timeAgo(trade.exit_time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">No recent trades found</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, alert = false }: { title: string, value: any, icon: any, alert?: boolean }) {
  return (
    <div className={`bg-slate-900/50 rounded-xl border p-4 ${alert ? 'border-rose-500/30' : 'border-slate-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${alert ? 'text-rose-400' : 'text-slate-500'}`} />
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{title}</span>
      </div>
      <div className={`text-2xl font-mono font-bold ${alert ? 'text-rose-400' : 'text-slate-200'}`}>
        {value}
      </div>
    </div>
  )
}
