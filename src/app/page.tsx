import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section animate-fade-in">
        <div>
          <h1 className="h1-hero">
            Bringing Community Back, <br/>
            <span style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-orange) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Through Gameplay.</span>
          </h1>
          <p className="p-hero">
            GamesHut is a community-driven platform using tabletop games and strategy experiences to reconnect people, teams, and the next generation.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/booking">
              <button className="btn-primary">
                Book an Experience
              </button>
            </Link>
            <Link href="/shop">
              <button className="btn-secondary">
                Visit Our Shop
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Experiences Section */}
      <section className="section-padding">
        <div className="text-center">
          <span className="badge">Our Experiences</span>
          <h2 className="section-title">Play. Connect. Bond.</h2>
          <p className="section-subtitle">
            We turn board games and strategy challenges into genuine human connection.
          </p>
        </div>
        
        <div className="grid-3">
          <div className="corp-card">
            <div className="card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '20px', marginBottom: '12px' }}>Curated Game Nights</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Meet new people, enjoy great food and drinks, and participate in gaming and team-building activities
            </p>
          </div>
          
          <div className="corp-card">
            <div className="card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '20px', marginBottom: '12px' }}>Corporate Team Bonding</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Custom-built offsites, icebreakers, and events designed to improve collaboration, build trust, and break team silos.
            </p>
          </div>

          <div className="corp-card">
            <div className="card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3.5 5.5h7c2-1 3.5-3 3.5-5.5a7 7 0 0 0-7-7z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '20px', marginBottom: '12px' }}>Trivia & Tournaments</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Aspirational regional championships, secondary school trivia competitions, and high-energy tabletop tournaments.
            </p>
          </div>
        </div>
      </section>

      {/* Curated Experience Packages Section */}
      <section className="section-padding">
        <div className="text-center">
          <span className="badge">Event Tiers</span>
          <h2 className="section-title">Curated Experience Packages</h2>
          <p className="section-subtitle">
            Choose the perfect scale and duration for your next gathering.
          </p>
        </div>
        
        <div className="grid-3">
          <div className="corp-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRIAL & INTERMEDIATE</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px', marginBottom: '15px' }}>Standard Package</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '20px' }}>
              ₦250,000
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '25px', flexGrow: 1 }}>
              Ideal for small team events, group game nights, and trivia regional heats.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
              <li>🕒 Up to 5 Hours Duration</li>
              <li>🎯 Curated Tabletop Games List</li>
              <li>🛡️ Professional Game Host</li>
            </ul>
            <Link href="/booking" style={{ marginTop: 'auto' }}>
              <button className="btn-secondary" style={{ width: '100%', padding: '12px' }}>Choose Standard</button>
            </Link>
          </div>

          <div className="corp-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid var(--color-brand)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-brand)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>MOST POPULAR</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px', marginBottom: '15px' }}>Cocktail Package</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '20px' }}>
              ₦800,000
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '25px', flexGrow: 1 }}>
              Perfect for facilitated corporate offsites, team events, and networking events.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
              <li>🕒 Up to 7 Hours Duration</li>
              <li>📦 Custom Game Bundles & Props</li>
              <li>🧠 Dedicated Game Masters & Hosts</li>
              <li>🏆 Interactive Summation Scoring</li>
            </ul>
            <Link href="/booking" style={{ marginTop: 'auto' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>Choose Cocktail</button>
            </Link>
          </div>

          <div className="corp-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>FULL DAY INCLUSION</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px', marginBottom: '15px' }}>Fiesta Package</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '20px' }}>
              ₦1,200,000
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '25px', flexGrow: 1 }}>
              Designed for large conventions, company fun days, and nationwide tournaments.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
              <li>🕒 Up to 12 Hours Duration</li>
              <li>🎒 Full Tabletop & Custom Armory</li>
              <li>🚀 Multi-Host Event Management</li>
              <li>🎖️ Medals, Trophies & Live FPL Standings</li>
            </ul>
            <Link href="/booking" style={{ marginTop: 'auto' }}>
              <button className="btn-secondary" style={{ width: '100%', padding: '12px' }}>Choose Fiesta</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="section-padding">
        <div className="grid-2">
          <div>
            <span className="badge">Why GamesHut</span>
            <h2 className="section-title">Interactive Play That Drives Connection</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '30px' }}>
              We believe in the power of physical presence. We replace passive screen-scrolling and polite small talk with active, cooperative tabletop strategy and communication challenges that make bonding natural.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-primary)', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '18px', fontWeight: 600 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--color-brand)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ lineHeight: 1.5 }}>High-end, premium board games and custom equipment setups</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--color-brand)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ lineHeight: 1.5 }}>Expert game masters who coordinate learning and match making</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--color-brand)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ lineHeight: 1.5 }}>Live scoreboards to track points and teams roster standings</span>
              </li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="hero-image-card" style={{ 
              width: '100%', maxWidth: '500px', height: '400px', 
              background: 'url(/hero-bg-analog.png) center center / cover'
            }} />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-section">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px' }}>Ready to Elevate Your Gathering?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.95, maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Join the organizers and innovators who trust GamesHut to deliver unforgettable tabletop experiences.
          </p>
          <Link href="/booking">
            <button className="btn-cta">
              Reserve Your Experience
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
