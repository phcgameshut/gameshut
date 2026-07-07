"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { storage, Player } from "@/lib/storage";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const pathname = usePathname();

  // Sync user state on mount and route changes
  useEffect(() => {
    const initSync = async () => {
      await storage.syncFromServer();
      const savedUserId = sessionStorage.getItem("gh_session_user_id");
      if (savedUserId) {
        const playersList = storage.getPlayers();
        const found = playersList.find(p => p.id === savedUserId);
        setCurrentUser(found || null);
      } else {
        setCurrentUser(null);
      }
    };
    initSync();
  }, [pathname]);

  // Close menu automatically on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Main navigation items (Profile removed from list)
  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Game Shop", href: "/shop" },
    { label: "Events", href: "/events" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Contact", href: "/contact" },
    { label: "Book Us", href: "/booking", special: true },
  ];

  return (
    <>
      <header className="navbar-wrapper">
        <nav className="navbar">
          <div className="nav-brand">
            <Link href="/">GamesHut</Link>
          </div>

          {/* Desktop Navigation links */}
          <div className="nav-links desktop-only">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={pathname === item.href ? "active-link" : ""}
                style={item.special ? {
                  background: 'rgba(59, 130, 246, 0.08)',
                  color: 'var(--color-brand)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  marginRight: '10px'
                } : {}}
              >
                {item.label}
              </Link>
            ))}

            {/* Profile Action Button */}
            {currentUser ? (
              <Link href="/profile" className="nav-profile-btn">
                Profile ({currentUser.name.split(' ')[0]})
              </Link>
            ) : (
              <Link href="/login" className="nav-profile-btn">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '24px',
              height: '18px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1100,
              padding: 0
            }}
          >
            <span style={{ width: '100%', height: '2px', background: 'var(--text-primary)', borderRadius: '2px' }} />
            <span style={{ width: '100%', height: '2px', background: 'var(--text-primary)', borderRadius: '2px' }} />
            <span style={{ width: '100%', height: '2px', background: 'var(--text-primary)', borderRadius: '2px' }} />
          </button>
        </nav>
      </header>

      {/* Mobile Drawer Overlay Menu with Close (X) Header */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(25px) saturate(190%)',
          WebkitBackdropFilter: 'blur(25px) saturate(190%)',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 40px 24px',
          animation: 'fadeInUp 0.3s ease-out forwards'
        }}>
          {/* Top Bar with Logo and Close X Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            position: 'absolute',
            top: 0, left: 0, right: 0
          }}>
            <span className="nav-brand" style={{ fontSize: '1.6rem', fontWeight: 800 }}>GamesHut</span>
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Close Navigation Menu"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '2.5rem',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                lineHeight: 1,
                padding: '5px 12px'
              }}
            >
              &times;
            </button>
          </div>

          {/* Links List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            alignItems: 'center',
            width: '100%',
            maxWidth: '280px'
          }}>
            {navItems.map((item, index) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  padding: '10px 20px',
                  width: '100%',
                  textAlign: 'center',
                  borderRadius: '12px',
                  background: item.special ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  color: item.special ? 'var(--color-brand)' : pathname === item.href ? 'var(--color-brand)' : 'var(--text-primary)',
                  border: item.special ? '1px solid rgba(59, 130, 246, 0.15)' : 'none',
                  transition: 'transform 0.2s ease',
                  animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                  opacity: 0,
                  transform: 'translateY(15px)'
                }}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Profile / Sign In Action button */}
            <div style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
              {currentUser ? (
                <Link 
                  href="/profile" 
                  onClick={() => setIsOpen(false)}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    padding: '12px 24px',
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: '12px',
                    background: 'var(--color-brand)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                    animation: `fadeInUp 0.3s ease-out ${navItems.length * 0.05}s forwards`,
                    opacity: 0,
                    transform: 'translateY(15px)'
                  }}
                >
                  Profile ({currentUser.name.split(' ')[0]})
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    padding: '12px 24px',
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: '12px',
                    background: 'var(--color-brand)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                    animation: `fadeInUp 0.3s ease-out ${navItems.length * 0.05}s forwards`,
                    opacity: 0,
                    transform: 'translateY(15px)'
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
