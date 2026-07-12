"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUserId = sessionStorage.getItem("gh_session_user_id");
      setIsLoggedIn(!!savedUserId);

      // Load events list and show up to 3 next events
      const list = storage.getEvents();
      setEvents(list.slice(0, 3));
    }
  }, []);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          
          {isLoggedIn ? (
            <span className="badge" style={{ fontSize: '0.85rem', padding: '6px 16px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.15)', fontWeight: 700, borderRadius: '20px' }}>
              Welcome back to GamesHut
            </span>
          ) : (
            <Link href="/login?tab=register" style={{ textDecoration: 'none' }}>
              <span className="badge animate-hover-pop" style={{ cursor: 'pointer', fontSize: '0.85rem', padding: '8px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', fontWeight: 700, borderRadius: '20px', display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                <span>Create a Free Account &amp; Play</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </Link>
          )}

          <h1 style={{ margin: 0, fontSize: '3.6rem', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>
            Bringing Community Back, <br/>
            <span style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-orange) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Through Gameplay.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '650px', margin: '5px 0 10px' }}>
            GamesHut is Nigeria's premier tabletop arena. We design custom team building sessions, school championships, and interactive game hubs that build genuine trust and intellectual play.
          </p>

          {!isLoggedIn ? (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/login?tab=register">
                <button className="btn-primary animate-hover-pop" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}>
                  Create Account &amp; Play
                </button>
              </Link>
              <Link href="/booking">
                <button className="btn-secondary animate-hover-pop" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700, background: '#ffffff' }}>
                  Book an Experience
                </button>
              </Link>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* 2. Our Experiences Section (Contained inside a Slate Gray Card Panel) */}
      <section className="scroll-reveal" style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '50px 30px', position: 'relative', zIndex: 1 }}>
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>Our Experiences</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '10px', color: 'var(--text-primary)' }}>Play. Connect. Bond.</h2>
          <p style={{ maxWidth: '600px', margin: '10px auto 0', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
            We turn tabletop strategy and communication challenges into genuine human connection.
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '18px', marginBottom: '10px' }}>Curated Game Events</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
              Gather with fellow strategists at Lagos' best venues to learn curated board games, join tournaments, and expand your network.
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
              Structured team offsites and icebreakers customized with physical tactical puzzles to improve collaboration and test team dynamics.
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
              High-energy school trivia leagues, regional board game championships, and leaderboard standings integration.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Next Events Section (Carousel of 3 Next Events) */}
      <section style={{ padding: '20px 0', position: 'relative', zIndex: 1 }}>
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>Upcoming</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '10px', color: 'var(--text-primary)' }}>Next Events</h2>
          <p style={{ maxWidth: '600px', margin: '10px auto 0', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
            Join our upcoming tournaments, school championships, and strategy meetups.
          </p>
        </div>
        
        {/* Carousel Component */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
              {events.length === 1 ? (
                // Single Event Card
                <div className="corp-card scroll-reveal" style={{ maxWidth: '650px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', border: '1px solid var(--card-border)', borderRadius: '16px', background: '#ffffff', boxShadow: 'var(--card-shadow)' }}>
                  {events[0].posterUrl && (
                    <div style={{ width: '100%', height: '220px', borderRadius: '12px', background: `url(${events[0].posterUrl}) center center / cover`, marginBottom: '10px' }} />
                  )}
                  <div style={{ textAlign: 'left' }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', fontSize: '0.8rem', display: 'inline-block', marginBottom: '10px' }}>{events[0].date}</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{events[0].title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>{events[0].location}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>{events[0].description}</p>
                    <Link href="/events">
                      <button className="btn-primary" style={{ padding: '10px 25px' }}>Get Tickets</button>
                    </Link>
                  </div>
                </div>
              ) : (
                // Slider Carousel
                <div style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '10px 0' }}>
                  <div style={{ 
                    display: 'flex', 
                    transition: 'transform 0.4s ease-out', 
                    transform: `translateX(-${activeSlide * 100}%)`,
                    width: '100%'
                  }}>
                    {events.map((evt) => (
                      <div key={evt.id} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '0 15px', display: 'flex', justifyContent: 'center' }}>
                        <div className="corp-card" style={{ maxWidth: '750px', width: '100%', display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px', border: '1px solid var(--card-border)', borderRadius: '16px', background: '#ffffff', boxShadow: 'var(--card-shadow)' }}>
                          {evt.posterUrl && (
                            <div style={{ width: '100%', height: '220px', borderRadius: '12px', background: `url(${evt.posterUrl}) center center / cover`, flexShrink: 0 }} />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
                            <span className="badge" style={{ alignSelf: 'flex-start', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', fontSize: '0.8rem', marginBottom: '12px' }}>{evt.date}</span>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.2 }}>{evt.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>{evt.location}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '20px' }}>{evt.description}</p>
                            <Link href="/events" style={{ marginTop: 'auto' }}>
                              <button className="btn-primary animate-hover-pop" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>Get Tickets</button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Carousel Controls */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', alignItems: 'center' }}>
                    <button 
                      className="btn-secondary" 
                      onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                      disabled={activeSlide === 0}
                      style={{ padding: '8px 16px', borderRadius: '50%', width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: activeSlide === 0 ? 0.4 : 1, cursor: activeSlide === 0 ? 'default' : 'pointer' }}
                    >
                      &larr;
                    </button>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {events.map((_, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => setActiveSlide(idx)}
                          style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: activeSlide === idx ? 'var(--color-brand)' : '#cbd5e1', 
                            cursor: 'pointer',
                            transition: 'background 0.2s' 
                          }} 
                        />
                      ))}
                    </div>

                    <button 
                      className="btn-secondary" 
                      onClick={() => setActiveSlide(prev => Math.min(events.length - 1, prev + 1))}
                      disabled={activeSlide === events.length - 1}
                      style={{ padding: '8px 16px', borderRadius: '50%', width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: activeSlide === events.length - 1 ? 0.4 : 1, cursor: activeSlide === events.length - 1 ? 'default' : 'pointer' }}
                    >
                      &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No upcoming events scheduled at this time. Check back soon!</p>
          )}
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
