"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -40px 0px"
    });

    const items = document.querySelectorAll(".scroll-reveal");
    items.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px 80px', display: 'flex', flexDirection: 'column', gap: '60px', position: 'relative' }}>
      
      {/* Background radial glow meshes */}
      <div style={{ position: 'absolute', top: '5%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* 1. Hero Section (Confined inside the container) */}
      <section className="hero-section animate-fade-in" style={{ minHeight: 'auto', padding: '60px 0 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge" style={{ fontSize: '0.85rem', padding: '6px 16px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.15)', fontWeight: 700, borderRadius: '20px' }}>
            Welcome to GamesHut
          </span>
          <h1 style={{ margin: 0, fontSize: '3.6rem', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
            Bringing Community Back, <br/>
            <span style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-orange) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Through Gameplay.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '620px', margin: '10px 0 15px' }}>
            GamesHut is a community-driven platform using tabletop games and strategy experiences to reconnect people, teams, and the next generation.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/booking">
              <button className="btn-primary animate-hover-pop" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}>
                Book an Experience
              </button>
            </Link>
            <Link href="/shop">
              <button className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700, background: '#ffffff' }}>
                Visit Our Shop
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Our Experiences Section (Contained inside a Slate Gray Card Panel) */}
      <section className="scroll-reveal" style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '50px 30px', position: 'relative', zIndex: 1 }}>
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>Our Experiences</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '10px', color: 'var(--text-primary)' }}>Play. Connect. Bond.</h2>
          <p style={{ maxWidth: '600px', margin: '10px auto 0', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
            We turn board games and strategy challenges into genuine human connection.
          </p>
        </div>
        
        <div className="grid-3">
          <div className="corp-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid var(--card-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <div className="card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.06)', padding: '10px', borderRadius: '10px', color: 'var(--color-brand)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '18px', marginBottom: '10px' }}>Curated Game Nights</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
              Meet new people, enjoy great food and drinks, and participate in gaming and team-building activities.
            </p>
          </div>
          
          <div className="corp-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid var(--card-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <div className="card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.06)', padding: '10px', borderRadius: '10px', color: 'var(--color-brand)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '18px', marginBottom: '10px' }}>Corporate Team Bonding</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
              Custom-built offsites, icebreakers, and events designed to improve collaboration, build trust, and break team silos.
            </p>
          </div>

          <div className="corp-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid var(--card-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <div className="card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.06)', padding: '10px', borderRadius: '10px', color: 'var(--color-brand)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3.5 5.5h7c2-1 3.5-3 3.5-5.5a7 7 0 0 0-7-7z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '18px', marginBottom: '10px' }}>Trivia & Tournaments</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
              Aspirational regional championships, secondary school trivia competitions, and high-energy tabletop tournaments.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Curated Experience Packages Section (Standalone card items on White Backdrop) */}
      <section style={{ padding: '20px 0', position: 'relative', zIndex: 1 }}>
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>Event Tiers</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '10px', color: 'var(--text-primary)' }}>Curated Experience Packages</h2>
          <p style={{ maxWidth: '600px', margin: '10px auto 0', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
            Choose the perfect scale and duration for your next gathering.
          </p>
        </div>
        
        <div className="grid-3">
          <div className="corp-card scroll-reveal delay-1" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', padding: '30px', border: '1px solid var(--card-border)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRIAL & INTERMEDIATE</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px', marginBottom: '15px' }}>Standard Package</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '15px', letterSpacing: '-0.5px' }}>
              ₦250,000
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
              Ideal for small team events, group game nights, and trivia regional heats.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Up to 5 Hours Duration
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                Curated Tabletop Games List
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Professional Game Host
              </li>
            </ul>
            <Link href="/booking" style={{ marginTop: 'auto' }}>
              <button className="btn-secondary" style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>Choose Standard</button>
            </Link>
          </div>

          <div className="corp-card scroll-reveal delay-2" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid var(--color-brand)', background: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.04)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-brand)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>MOST POPULAR</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px', marginBottom: '15px' }}>Cocktail Package</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '15px', letterSpacing: '-0.5px' }}>
              ₦800,000
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
              Perfect for facilitated corporate offsites, team events, and networking events.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Up to 7 Hours Duration
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  Custom Game Bundles & Props
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Dedicated Game Masters & Hosts
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                Interactive Summation Scoring
              </li>
            </ul>
            <Link href="/booking" style={{ marginTop: 'auto' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>Choose Cocktail</button>
            </Link>
          </div>

          <div className="corp-card scroll-reveal delay-3" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', padding: '30px', border: '1px solid var(--card-border)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>FULL DAY INCLUSION</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px', marginBottom: '15px' }}>Fiesta Package</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '15px', letterSpacing: '-0.5px' }}>
              ₦1,200,000
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
              Designed for large conventions, company fun days, and nationwide tournaments.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Up to 12 Hours Duration
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                Full Tabletop & Custom Armory
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Multi-Host Event Management
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                Medals, Trophies & Live Standings
              </li>
            </ul>
            <Link href="/booking" style={{ marginTop: 'auto' }}>
              <button className="btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>Choose Fiesta</button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Value Proposition Section (Contained inside a Slate Gray Card Panel) */}
      <section className="scroll-reveal" style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '50px 30px', position: 'relative', zIndex: 1 }}>
        <div className="grid-2">
          <div>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>Why GamesHut</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '10px', color: 'var(--text-primary)' }}>Interactive Play That Drives Connection</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '25px', marginTop: '15px' }}>
              We believe in the power of physical presence. We replace passive screen-scrolling and polite small talk with active, cooperative tabletop strategy and communication challenges that make bonding natural.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '15px', fontWeight: 600 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--color-brand)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ lineHeight: 1.4 }}>High-end, premium board games and custom equipment setups</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--color-brand)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ lineHeight: 1.4 }}>Expert game masters who coordinate learning and matchmaking</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--color-brand)',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ lineHeight: 1.4 }}>Live scoreboard tracking of standings and team standings</span>
              </li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="hero-image-card" style={{ 
              width: '100%', maxWidth: '450px', height: '350px', 
              background: 'url(/hero-bg-analog.png) center center / cover',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
            }} />
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA Section (Contained Gradient Panel Card matching user mockup image) */}
      <section className="scroll-reveal" style={{ 
        background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-orange) 100%)', 
        borderRadius: '24px', 
        padding: '70px 40px', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        color: 'white',
        boxShadow: '0 15px 40px rgba(99, 102, 241, 0.15)'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '20px', color: 'white', letterSpacing: '-1px', lineHeight: 1.1 }}>Ready to Elevate Your Gathering?</h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '35px', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
            Join the organizers and innovators who trust GamesHut to deliver unforgettable tabletop experiences.
          </p>
          <Link href="/booking">
            <button className="btn-cta" style={{ background: '#ffffff', color: 'var(--color-brand)', fontWeight: 800, border: 'none', padding: '14px 36px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              Reserve Your Experience
            </button>
          </Link>
        </div>
      </section>
      
    </div>
  );
}
