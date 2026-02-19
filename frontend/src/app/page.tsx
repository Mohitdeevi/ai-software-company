import Link from 'next/link';
import {
  Brain,
  Code,
  Rocket,
  ArrowRight,
  Sparkles,
  Cpu,
  FileCode,
  CloudUpload,
  Shield,
  Zap,
  GitBranch,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Agent Orchestra',
    description: '11 specialized agents — from Product Manager to DevOps — collaborate autonomously to build your app.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Code,
    title: 'Full-Stack Generation',
    description: 'Backend APIs, database schemas, frontend UI, authentication — every layer generated and wired together.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Rocket,
    title: 'Production Infrastructure',
    description: 'Docker, Kubernetes, CI/CD pipelines, monitoring — production-grade from the first build.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Security Built-In',
    description: 'JWT auth, RBAC, rate limiting, input validation, and dependency auditing — not afterthoughts.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Self-Healing Builds',
    description: 'Automatic error detection and fix loops. Failed builds retry intelligently up to 3 times.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Observability',
    description: 'Prometheus metrics, structured logging, health checks, and alerting configured out of the box.',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

const steps = [
  { icon: Sparkles, step: '01', title: 'Describe Your App', description: 'Enter a plain-English prompt describing what you want to build.' },
  { icon: Cpu, step: '02', title: 'Agents Collaborate', description: '11 AI agents execute in phases — strategy, architecture, code, tests, infra.' },
  { icon: FileCode, step: '03', title: 'Code Materializes', description: 'Watch files appear in real-time with syntax highlighting and build logs.' },
  { icon: CloudUpload, step: '04', title: 'Ship to Production', description: 'Download your project or deploy directly to Kubernetes with one click.' },
];

const stats = [
  { value: '11', label: 'AI Agents' },
  { value: '9', label: 'Execution Phases' },
  { value: '<15min', label: 'Avg Build Time' },
  { value: '80%+', label: 'First-Pass Success' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-float-slow" />
        <div className="absolute top-[30%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] animate-float-reverse" />
        <div className="absolute bottom-[-10%] left-[30%] h-[400px] w-[400px] rounded-full bg-pink-600/[0.08] blur-[100px] animate-float-slow" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-gray-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-lg font-bold text-white">PromptCorp<span className="text-indigo-400"> OS</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white">
              Sign In
            </Link>
            <Link href="/register" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm border border-white/10 transition-all hover:bg-white/15 hover:border-white/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-44 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Multi-Agent Orchestration Platform
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              One Prompt
              <span className="block text-gradient mt-2">Production App</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
              Describe your application in plain English. 11 specialized AI agents collaborate to
              architect, code, test, and deploy your full-stack app in minutes.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">Start Building</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-gray-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <GitBranch className="h-4 w-4" />
                View Demo
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-20 max-w-3xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-5 text-center">
                  <div className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative border-t border-white/5 py-24 sm:py-32">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Everything to ship <span className="text-gradient">production-ready</span>
            </h2>
            <p className="mt-4 text-lg text-gray-400">Not just code generation — full lifecycle orchestration.</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group glass-card rounded-2xl p-7 transition-all duration-300 hover:border-white/15 hover:bg-gray-900/80">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative border-t border-white/5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Four steps. That&apos;s it.</h2>
            <p className="mt-4 text-lg text-gray-400">From idea to deployed application.</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.step} className="relative group">
                {i < steps.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-indigo-500/30 to-transparent lg:block" />
                )}
                <div className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:border-indigo-500/30">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                    <step.icon className="h-7 w-7 text-indigo-400" />
                  </div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Step {step.step}</div>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-600/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Ready to build something?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">Join the future of software development. One prompt is all it takes.</p>
          <div className="mt-10">
            <Link href="/register" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]">
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} PromptCorp OS. Built with AI agents.
        </div>
      </footer>
    </div>
  );
}
