import Icon from './Icon'
import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

export function Brand() {
  return <div className="flex items-center gap-3"><div className="brand-mark"><svg width="25" height="25" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m5 22 9-17 9 17M9 16h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div><span className="text-[19px] font-semibold tracking-[.17em] text-white">ARMANE<span className="text-violet-400">.</span></span></div>
}

function DashboardPreview() {
  return <div className="preview-scene" aria-hidden="true">
    <div className="scene-ring ring-one" /><div className="scene-ring ring-two" />
    <div className="dashboard-preview">
      <div className="preview-sidebar"><div className="mini-mark">A</div><div className="sidebar-square active"><Icon name="chart" size={16} /></div><div className="sidebar-square"><Icon name="bag" size={16} /></div><div className="sidebar-square"><Icon name="user" size={16} /></div><div className="sidebar-square"><Icon name="sparkle" size={16} /></div><div className="sidebar-bottom" /></div>
      <div className="preview-body">
        <div className="flex items-center justify-between"><div><div className="preview-eyebrow">YOUR BUSINESS, AT A GLANCE</div><div className="mt-1 text-[15px] font-semibold text-white">Overview</div></div><div className="preview-avatar">A</div></div>
        <div className="preview-stats"><div><span>Total revenue</span><strong>$24,580<span> .00</span></strong><small>↗ 18.6% this month</small></div><div className="stat-bars">{[32, 56, 40, 68, 50, 86].map((height, index) => <i key={index} style={{height: `${height}%`}} />)}</div></div>
        <div className="flex justify-between text-[9px] text-slate-400"><span>Revenue overview</span><span className="text-violet-300">This month⌄</span></div>
        <div className="preview-chart"><div className="chart-grid" /><svg viewBox="0 0 330 105" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity=".34" /><stop offset="100%" stopColor="#a78bfa" stopOpacity="0" /></linearGradient></defs><path d="M0 88C25 88 22 58 48 66S80 88 105 48S140 77 170 49S203 74 225 34S260 47 285 22S305 31 330 7V105H0Z" fill="url(#chartFill)"/><path d="M0 88C25 88 22 58 48 66S80 88 105 48S140 77 170 49S203 74 225 34S260 47 285 22S305 31 330 7" fill="none" stroke="#bca5ff" strokeWidth="2.5" /></svg></div>
        <div className="preview-months"><span>Jun 01</span><span>Jun 07</span><span>Jun 14</span><span>Jun 21</span><span>Jun 30</span></div>
        <div className="preview-orders"><div className="order-image"><Icon name="bag" size={15} /></div><div><b>Recent orders</b><span>Everything is right where you need it.</span></div><div className="order-status">Completed</div></div>
      </div>
    </div>
    <div className="floating-order"><div className="float-icon"><Icon name="check" size={16} /></div><div><b>New order received</b><span>One more reason to celebrate.</span></div><div className="float-dot" /></div>
    <div className="floating-growth"><div className="text-violet-300"><Icon name="chart" size={18} /></div><div><span>GROWTH</span><b>+32.8% <small>↗</small></b></div></div>
  </div>
}

export default function AuthLayout({ mode, children }) {
  const login = mode === 'login'
  return <div className="auth-page relative isolate min-h-screen overflow-hidden px-5 py-7 sm:px-8 sm:py-9">
    <div className="background-orb orb-violet" /><div className="background-orb orb-blue" /><div className="background-orb orb-pink" /><div className="page-grain" />
    <header className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4"><Brand /><div className="flex items-center gap-4"><span className="hidden text-[13px] text-slate-400 sm:block">{login ? 'New here?' : 'Already a member?'}</span><Link to={login ? '/register' : '/login'} className="header-link">{login ? 'Create account' : 'Log in'}<Icon name="arrow" size={15} /></Link></div></header>
    <main className="auth-card relative z-10 mx-auto mt-9 grid w-full max-w-[1100px] lg:mt-12 lg:grid-cols-[1.05fr_1fr]">
      <aside className="story-panel relative flex flex-col overflow-hidden px-8 pb-8 pt-10 sm:px-11 sm:pt-12 lg:px-11">
        <div className="story-light" /><div className="relative z-10"><div className="eyebrow-pill"><span className="h-1.5 w-1.5 rounded-full bg-violet-300" />A LITTLE SIMPLER. A LOT SMARTER.</div><h2 className="mt-7 max-w-[420px] text-[37px] leading-[1.16] font-semibold tracking-[-.045em] text-white sm:text-[43px]">Your next chapter.<br /><span className="gradient-text">Beautifully managed.</span></h2><p className="mt-5 max-w-[350px] text-[14px] leading-7 text-slate-400">A clearer view of your business. More room for your ideas. All in one beautiful space.</p></div>
        <DashboardPreview />
        <div className="relative z-10 mt-auto flex items-center gap-3 border-t border-white/[.07] pt-6"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.08] text-violet-300"><Icon name="sparkle" size={17} /></div><div><p className="text-xs font-medium text-slate-200">Less busywork. More possibility.</p><p className="mt-1 text-[11px] text-slate-500">A thoughtfully designed workspace for your next step.</p></div></div>
      </aside>
      <section className="form-panel relative px-7 py-10 sm:px-12 sm:py-12 lg:px-12"><div className="mx-auto w-full max-w-[380px]">{children}</div></section>
    </main>
    <footer className="relative z-10 mx-auto mt-7 flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-1 pb-2 text-[11px] text-slate-500"><span>© {currentYear} ARMANE. Made for your next chapter.</span><span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-violet-400" />Thoughtfully simple</span></footer>
  </div>
}
