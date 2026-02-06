import Link from "next/link";
import {
  ArrowRight, Upload, Briefcase, Shield, Brain, Code,
  Zap, CheckCircle, TrendingUp, Users, Activity
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-float-delayed" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-fuchsia-600/5 blur-[80px]" />
        <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold text-xl tracking-tight">Elite Hire</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-violet-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              AI-Powered Recruitment Engine v2.0
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Hiring with <br /> <span className="gradient-text">Superhuman</span> <br /> Intelligence.
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Eliminate bias and save 90% of screening time. Our autonomous AI evaluates candidates on code, character, and communication in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="group h-12 px-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
                Recruiter Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/candidate/upload" className="h-12 px-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-foreground font-medium flex items-center justify-center gap-2 transition-all backdrop-blur-sm">
                Candidate Portal <Upload className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-4 text-sm text-muted-foreground animate-fade-up delay-200">
              <Link href="/candidate/match" className="flex items-center gap-2 hover:text-primary transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <span>Looking for a job? <span className="text-foreground underline decoration-primary/50 underline-offset-4 group-hover:decoration-primary">Analyze my resume for best fit</span></span>
              </Link>
            </div>
          </div>

          <div className="relative h-[600px] hidden lg:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-slow-spin" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full animate-slow-spin delay-200" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 glass-panel rounded-xl p-4 animate-float z-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-400" /></div>
                  <div>
                    <div className="text-sm font-semibold">Match Found</div>
                    <div className="text-xs text-muted-foreground">98% Compatibility</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-green-400">+4.2%</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-[92%]" /></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Technical</span><span>92/100</span></div>
              </div>
            </div>

            <div className="absolute top-20 right-10 w-48 glass-panel rounded-lg p-3 animate-float-delayed z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                <div className="space-y-1">
                  <div className="h-2 w-20 bg-white/10 rounded" />
                  <div className="h-2 w-12 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex gap-1">
                {['React', 'Node'].map(tag => <span key={tag} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/60">{tag}</span>)}
              </div>
            </div>

            <div className="absolute bottom-32 left-0 w-56 glass-panel rounded-lg p-4 animate-float z-30">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground"><Code className="w-3 h-3" /><span>assessment.ts</span></div>
              <div className="space-y-1.5 font-mono text-[10px] opacity-70">
                <div className="flex gap-2"><span className="text-purple-400">const</span> score = <span className="text-blue-400">await</span> ai.eval();</div>
                <div className="flex gap-2"><span className="text-purple-400">if</span> (score &gt; 90) <span className="text-green-400">hire()</span>;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Comprehensive Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three pillars of assessment, one unified score.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Brain className="w-8 h-8 text-violet-400" />, title: "Psychometric Profiling", desc: "Analyze personality traits like resilience and teamwork using standard OCEAN models." },
              { icon: <Code className="w-8 h-8 text-blue-400" />, title: "Technical Sandbox", desc: "Live coding environments with automated test cases and complexity analysis." },
              { icon: <Shield className="w-8 h-8 text-green-400" />, title: "Anti-Cheating Proctor", desc: "Browser-lockdown, gaze tracking, and tab-switch detection ensure full integrity." }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl glass-card-hover group">
                <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:border-white/10 transition-colors">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold">From Application to <span className="text-violet-400">New Hire</span> in Minutes.</h2>
              <div className="space-y-6">
                {[
                  { title: "Upload Resume", desc: "AI parses PDF/Docx to extract skills and experience." },
                  { title: "Take Assessment", desc: "Candidate completes a secure 3-stage modular exam." },
                  { title: "View Analysis", desc: "Recruiters get a ranked leaderboard with fit scores." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400">{i + 1}</div>
                      {i !== 2 && <div className="w-px h-full bg-violet-500/10 my-2" />}
                    </div>
                    <div><h4 className="font-bold text-lg">{step.title}</h4><p className="text-muted-foreground">{step.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[400px] glass-panel rounded-2xl border border-white/5 p-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent" />
              <div className="relative h-full w-full bg-background/50 rounded-xl overflow-hidden flex flex-col">
                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">{['red', 'yellow', 'green'].map(c => <div key={c} className={`w-3 h-3 rounded-full bg-${c}-500/20`} />)}</div>
                </div>
                <div className="p-6 flex-1 flex items-center justify-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-32 glass-panel rounded-lg flex flex-col items-center justify-center gap-2 animate-pulse">
                      <Upload className="w-6 h-6 text-muted-foreground" /><div className="h-2 w-12 bg-white/10 rounded" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20" />
                    <div className="w-24 h-32 glass-panel rounded-lg flex flex-col items-center justify-center gap-2 border-violet-500/30 bg-violet-500/5">
                      <Activity className="w-6 h-6 text-violet-400 animate-bounce" /><div className="h-2 w-12 bg-white/10 rounded" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20" />
                    <div className="w-24 h-32 glass-panel rounded-lg flex flex-col items-center justify-center gap-2 border-green-500/30 bg-green-500/5">
                      <CheckCircle className="w-6 h-6 text-green-400" /><div className="h-2 w-12 bg-white/10 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Candidates Processed", value: "10k+", icon: <Users className="w-5 h-5 text-blue-400" /> },
              { label: "Hours Saved", value: "85%", icon: <Zap className="w-5 h-5 text-yellow-400" /> },
              { label: "Placement Rate", value: "98%", icon: <TrendingUp className="w-5 h-5 text-green-400" /> },
              { label: "Assessment Modules", value: "15+", icon: <Brain className="w-5 h-5 text-purple-400" /> },
            ].map((metric, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="flex items-center justify-center mb-2 opacity-50">{metric.icon}</div>
                <div className="text-4xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs text-white font-bold">E</div>
            <span className="font-semibold">Elite Hire</span>
          </div>
          <div className="text-sm text-muted-foreground">© 2024 Elite Hire Architecture. All rights reserved.</div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            {['Privacy', 'Terms', 'Contact'].map(item => <a key={item} href="#" className="hover:text-foreground">{item}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
