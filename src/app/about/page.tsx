export default function About() {
  return (
    <div className="container section-padding animate-fade-in">
      {/* Main Pitch */}
      <div className="text-center">
        <span className="badge">Our Identity</span>
        <h1 className="section-title">Bringing Community Back.</h1>
        <p className="section-subtitle">
          GamesHut is a community-driven platform using analog strategy games to reconnect people, teams, and the next generation.
        </p>
      </div>

      {/* The Story & Philosophy */}
      <div className="grid-2" style={{ marginBottom: '60px', alignItems: 'stretch' }}>
        <div className="corp-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brand)', marginBottom: '15px' }}>
            Our Philosophy: Screen-Free Synergy
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, flexGrow: 1 }}>
            Modern life is hyper-connected online but increasingly disconnected in the real world. We believe that analog play—whether through strategic board games, collaborative team puzzles, or live trivia—is the ultimate icebreaker. By encouraging people to unplug and sit around a shared table, we make team-building feel natural, cooperative, and fun.
          </p>
        </div>
        
        <div className="corp-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brand)', marginBottom: '15px' }}>
            Gatherings Across Lagos
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, flexGrow: 1 }}>
            Lagos is a high-energy metropolis. We design cozy, well-facilitated strategy hubs where corporate teams, student circles, and strategy game enthusiasts can gather comfortably. By partnering with premium lounges, corporate venues, and educational campuses, we create accessible gaming environments all across the city.
          </p>
        </div>
      </div>

      {/* Three Directions */}
      <div className="text-center" style={{ marginTop: '80px' }}>
        <span className="badge">Pillars</span>
        <h2 className="section-title">Our Event Formats</h2>
        <p className="section-subtitle">We design our gaming activations to serve three primary environments.</p>
      </div>
      
      <div className="grid-3" style={{ marginBottom: '60px' }}>
        <div className="corp-card" style={{ background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 800 }}>Individuals & Events</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Social tabletop game nights where you can attend, learn new strategy games, and meet a vibrant community.
          </p>
        </div>
        <div className="corp-card" style={{ background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 800 }}>Organizations & Offsites</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Structured team offsites and communication challenges customized to break the ice and build workplace alignment.
          </p>
        </div>
        <div className="corp-card" style={{ background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 800 }}>Schools & Tournaments</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            High-energy trivia championships and regional strategy leagues that make learning social and collaborative.
          </p>
        </div>
      </div>

      {/* Our Promise */}
      <div className="corp-card text-center" style={{ padding: '60px 40px', background: 'var(--bg-secondary)' }}>
        <span className="badge">Our Standard</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '15px' }}>
          Premium Facilitation
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto' }}>
          We don't just drop off games; we deliver a complete host experience. Every session is led by professional Game Masters who explain rules, coordinate matchups, and handle all the logistics, supported by our live scoring dashboard systems.
        </p>
      </div>
    </div>
  );
}
