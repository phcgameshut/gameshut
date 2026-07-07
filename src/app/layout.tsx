import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Header from "./components/Header";
import FooterAdminLink from "./components/FooterAdminLink";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GamesHut | Premium Team Bonding & Analog Strategy",
  description: "GamesHut brings communities and teams back together through curated analog gaming experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/* Background Decorative Mesh Blobs */}
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>

        {/* Responsive Navbar */}
        <Header />

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-brand-col">
              <div className="footer-brand">GamesHut</div>
              <p className="footer-brand-desc">
                Bringing communities and teams back together through curated tabletop gaming and social strategy experiences.
              </p>
            </div>
            <div className="footer-links-col">
              <h4>Experiences</h4>
              <Link href="/booking">Book an Event</Link>
              <Link href="/events">Upcoming Events</Link>
              <Link href="/leaderboard">Leaderboard Standings</Link>
              <Link href="/profile">Player Profile</Link>
            </div>
            <div className="footer-links-col">
              <h4>Company</h4>
              <Link href="/about">About Our Mission</Link>
              <Link href="/contact">Get in Touch</Link>
              <Link href="/shop">Board Game Shop</Link>
            </div>
            <div className="footer-links-col">
              <h4>Follow Us</h4>
              <a href="https://instagram.com/gameshutng" target="_blank" rel="noopener noreferrer">@gameshutng</a>
              <FooterAdminLink />
            </div>
          </div>
          <div className="container footer-bottom">
            <p>&copy; {new Date().getFullYear()} GamesHut. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
