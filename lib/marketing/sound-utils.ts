"use client";

let lastPlayedTimestamp = 0;

/**
 * Play official Bharat Connect MOGO MP3 audio sound (/marketing/assets/BharatConnect MOGO 270824.mp3)
 * Includes a 2-second throttle guard to ensure sound plays exactly ONCE during payment flow.
 */
export function playPaymentSuccessSound() {
  if (typeof window === "undefined") return;

  const now = Date.now();
  if (now - lastPlayedTimestamp < 2000) {
    return;
  }
  lastPlayedTimestamp = now;

  try {
    const audio = new Audio("/marketing/assets/BharatConnect MOGO 270824.mp3");
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio playback prevented or failed:", err);
      });
    }
  } catch (err) {
    console.warn("Audio playback error:", err);
  }
}
