"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";

export default function FooterAdminLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = () => {
      if (typeof window === "undefined") return;
      const savedUserId = sessionStorage.getItem("gh_session_user_id");
      if (savedUserId) {
        const playersList = storage.getPlayers();
        const found = playersList.find(p => p.id === savedUserId);
        if (found && found.role === "admin") {
          setIsAdmin(true);
          return;
        }
      }
      setIsAdmin(false);
    };

    checkRole();
    
    const interval = setInterval(checkRole, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) return null;

  return (
    <Link href="/admin" className="admin-footer-link">Admin Panel</Link>
  );
}
