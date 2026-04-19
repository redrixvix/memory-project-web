import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-5 px-6 md:px-10 flex justify-between items-center">
        <div className="text-xl font-bold text-accent tracking-tight">Memory Project</div>
        <nav className="flex gap-5 items-center">
          <Link href="/login" className="text-sm text-muted hover:text-accent transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-accent text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        <div className="max-w-2xl space-y-8">
          {/* Decorative leaf/vine element */}
          <div className="flex justify-center mb-2">
            <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="text-accent opacity-60">
              <path d="M24 12C24 12 8 4 4 12C4 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.3"/>
              <path d="M24 12C24 12 40 4 44 12C44 20 24 20 24 12Z" fill="currentColor" fillOpacity="0.3"/>
              <circle cx="24" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            Capture the stories<br />that matter
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-xl mx-auto leading-relaxed">
            A beautiful way to preserve your family&apos;s memories. Write, photograph, and record — then print a hardcover book to treasure forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/signup"
              className="bg-accent text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-accent-light transition-colors shadow-sm"
            >
              Start your book — free
            </Link>
            <Link
              href="#pricing"
              className="border-2 border-accent text-accent px-8 py-4 rounded-full text-base font-semibold hover:bg-accent hover:text-white transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>

        {/* Memory Preview Cards — warm, inviting */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full">
          {[
            {
              emoji: "💍",
              title: "Your wedding day",
              preview: "We danced until 2am, and grandma insisted on teaching everyone the twist...",
              accent: "#8B6914"
            },
            {
              emoji: "☕",
              title: "First day at work",
              preview: "I was so nervous that first morning, I spilled coffee all over my new desk...",
              accent: "#5A3D2D"
            },
            {
              emoji: "🏞️",
              title: "Summer at the lake",
              preview: "Every July we'd pack the station wagon and drive up to cabin 14...",
              accent: "#2D5A3D"
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-card p-6 rounded-2xl shadow-sm border border-border text-left relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Subtle decorative corner */}
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10"
                style={{ backgroundColor: card.accent }}
              />
              <div className="text-3xl mb-3">{card.emoji}</div>
              <p className="text-sm font-semibold mb-2" style={{ color: card.accent }}>{card.title}</p>
              <p className="text-muted text-sm leading-relaxed">{card.preview}</p>
            </div>
          ))}
        </div>
      </main>

      {/* How it works — warm two-tone section */}
      <section className="py-20 px-6 md:px-10 bg-accent text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">How it works</h2>
          <p className="text-center mb-12 opacity-80 text-sm">Three steps to a family treasure</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                num: "1",
                title: "Write your memories",
                desc: "Answer guided prompts or write freely. Your words, your voice.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                )
              },
              {
                num: "2",
                title: "Add photos & audio",
                desc: "Upload photos and record voice memories that bring stories to life.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                )
              },
              {
                num: "3",
                title: "Print a real book",
                desc: "Turn your memories into a beautiful hardcover book, shipped to your door.",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                )
              },
            ].map((f, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  {f.icon}
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold mx-auto">
                  {f.num}
                </div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="opacity-80 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Simple, honest pricing</h2>
          <p className="text-muted text-center mb-12">Start free. Pay only for photos, audio, and printing.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Free</div>
              <p className="text-4xl font-bold mb-1">$0</p>
              <p className="text-sm text-muted mb-6">forever</p>
              <ul className="space-y-2.5 text-sm text-muted mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Unlimited text memories
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Guided writing prompts
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  One memory book
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  Photos & audio
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  Printed books
                </li>
              </ul>
              <Link href="/signup" className="mt-auto block text-center border-2 border-accent text-accent py-2.5 rounded-full font-semibold hover:bg-accent hover:text-white transition-colors text-sm">
                Get started
              </Link>
            </div>

            {/* 5GB — featured */}
            <div className="bg-card p-6 rounded-2xl border-2 border-accent relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
                Most Popular
              </div>
              <div className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">5GB Storage</div>
              <p className="text-4xl font-bold mb-1">$50</p>
              <p className="text-sm text-muted mb-6">for 5 years</p>
              <ul className="space-y-2.5 text-sm text-muted mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  5GB photo & audio storage
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Printed books from $99
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Family collaboration
                </li>
              </ul>
              <Link href="/signup" className="mt-auto block text-center bg-accent text-white py-2.5 rounded-full font-semibold hover:bg-accent-light transition-colors text-sm shadow-sm">
                Upgrade
              </Link>
            </div>

            {/* 15GB */}
            <div className="bg-card p-6 rounded-2xl border border-border">
              <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">15GB Storage</div>
              <p className="text-4xl font-bold mb-1">$100</p>
              <p className="text-sm text-muted mb-6">for 5 years</p>
              <ul className="space-y-2.5 text-sm text-muted mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Everything in 5GB
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  15GB photo & audio storage
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  Priority support
                </li>
              </ul>
              <Link href="/signup" className="mt-auto block text-center border-2 border-accent text-accent py-2.5 rounded-full font-semibold hover:bg-accent hover:text-white transition-colors text-sm">
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Warm closing CTA */}
      <section className="py-16 px-6 md:px-10 bg-amber-50 border-t border-amber-100">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="text-4xl mb-2">📖</div>
          <h2 className="text-2xl font-bold">Every family has stories worth keeping</h2>
          <p className="text-muted">Start writing yours today. It&apos;s free to begin, and your memories grow more valuable with every year.</p>
          <Link
            href="/signup"
            className="inline-block bg-accent text-white px-8 py-3.5 rounded-full font-semibold hover:bg-accent-light transition-colors shadow-sm"
          >
            Create your memory book
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-10 border-t border-border text-center text-muted text-sm">
        <p>© 2024 Memory Project · Made with care for families everywhere</p>
      </footer>
    </div>
  );
}