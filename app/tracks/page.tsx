"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import tracksData from "@/data/tracks.json";
import TopNavbar from "../../components/TopNavbar";
import type { AuthUser } from "@/types/auth";

// ── Types ──────────────────────────────────────────────────
interface Track {
  id: string;
  mainFeature?: boolean;
  title: string;
  shortTitle?: string;
  featureLabel?: string;
  description: string;
  duration: string;
  lessonsCount: number;
  emoji: string;
  image?: string;
}

// ── Featured Card ──────────────────────────────────────────
function FeaturedTrackCard({
  track,
  onClick,
}: {
  track: Track;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="cursor-pointer w-full mb-6"
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      >
        {track.image ? (
          <Image
            src={track.image}
            alt={track.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: "rgba(18,30,23,0.08)" }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,18,14,0.92) 0%, rgba(10,18,14,0.4) 45%, transparent 70%)",
          }}
        />

        {track.featureLabel && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-[10px]"
              style={{
                fontFamily: "var(--font-sans-medium)",
                backgroundColor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {track.featureLabel}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 right-0 left-0 p-4">
          <h2
            className="text-white text-lg leading-snug mb-1"
            style={{ fontFamily: "var(--font-sans-medium)" }}
          >
            {track.title}
          </h2>
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{
              fontFamily: "var(--font-sans-light)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {track.description}
          </p>
          <div
            className="flex items-center gap-3 mt-3 text-[11px]"
            style={{
              fontFamily: "var(--font-sans-light)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span>{track.lessonsCount} درس</span>
            <span>·</span>
            <span>{track.duration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Grid Card ──────────────────────────────────────────────
function GridTrackCard({
  track,
  onClick,
  delay,
}: {
  track: Track;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-2"
    >
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{ aspectRatio: "1/1" }}
      >
        {track.image ? (
          <Image
            src={track.image}
            alt={track.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: "rgba(18,30,23,0.06)" }}
          >
            📚
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-0.5">
        <h3
          className="text-xs leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-sans-medium)" }}
        >
          {track.shortTitle ?? track.title}
        </h3>
        <span
          className="text-[10px]"
          style={{ fontFamily: "var(--font-sans-light)", opacity: 0.45 }}
        >
          {track.lessonsCount} درس · {track.duration}
        </span>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function TracksPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const { tracks } = tracksData;
  const featuredTrack = tracks.find((t) => t.mainFeature);
  const gridTracks = tracks.filter((t) => !t.mainFeature);

  // Fetch session — same pattern as HomePage
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const { user: u } = await res.json();
          setUser(u);
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/");
      }
    };
    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div
      className="min-h-dvh overflow-x-hidden w-screen flex flex-col relative"
      dir="rtl"
      style={{
        backgroundColor: "var(--color-cream)",
        color: "var(--color-darkest)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-48 rounded-full blur-3xl pointer-events-none opacity-10 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--color-forest) 0%, transparent 75%)",
        }}
      />

      {user && (
        <div className="p-4 z-10">
          <TopNavbar user={user} onLogout={handleLogout} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 pb-12 max-w-md w-full mx-auto z-10">
        {featuredTrack && (
          <FeaturedTrackCard
            track={featuredTrack as Track}
            onClick={() => router.push(`/tracks/${featuredTrack.id}`)}
          />
        )}

        {gridTracks.length > 0 && (
          <div className="flex flex-col gap-3">
            <p
              className="text-xs opacity-40 mb-1"
              style={{ fontFamily: "var(--font-sans-medium)" }}
            >
              مسارات أخرى
            </p>
            <div className="grid grid-cols-2 gap-3">
              {gridTracks.map((track, idx) => (
                <GridTrackCard
                  key={track.id}
                  track={track as Track}
                  onClick={() => router.push(`/tracks/${track.id}`)}
                  delay={idx * 0.07}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
