import confetti from "canvas-confetti";

// Canvas-confetti helpers
export function confettiBurst() {
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 38,
    origin: { y: 0.2 },
    scalar: 1,
  });
}

export function confettiLong(durationMs = 5000) {
  const end = Date.now() + durationMs;
  const colors = ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9"];

  (function frame() {
    confetti({
      particleCount: 8,
      angle: 60,
      spread: 55,
      startVelocity: 45,
      origin: { x: 0, y: 0.3 },
      colors,
    });
    confetti({
      particleCount: 8,
      angle: 120,
      spread: 55,
      startVelocity: 45,
      origin: { x: 1, y: 0.3 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Full page confetti celebration from top
export function confettiFullPage(durationMs = 8000) {
  const end = Date.now() + durationMs;
  const colors = ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9", "#EC4899", "#8B5CF6", "#06B6D4"];

  (function frame() {
    // Confetti from top center
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 60,
      startVelocity: 45,
      origin: { x: 0.5, y: 0 },
      colors,
      gravity: 0.8,
      drift: 0,
    });

    // Confetti from top left
    confetti({
      particleCount: 30,
      angle: 75,
      spread: 55,
      startVelocity: 50,
      origin: { x: 0.2, y: 0 },
      colors,
      gravity: 0.8,
    });

    // Confetti from top right
    confetti({
      particleCount: 30,
      angle: 105,
      spread: 55,
      startVelocity: 50,
      origin: { x: 0.8, y: 0 },
      colors,
      gravity: 0.8,
    });

    // Burst from center top
    confetti({
      particleCount: 40,
      spread: 360,
      startVelocity: 30,
      origin: { x: 0.5, y: 0.1 },
      colors,
      gravity: 0.6,
      scalar: 1.2,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Epic celebration with multiple bursts
export function confettiEpicCelebration() {
  // Initial massive burst from top
  confetti({
    particleCount: 200,
    angle: 90,
    spread: 70,
    startVelocity: 60,
    origin: { x: 0.5, y: 0 },
    colors: ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9", "#EC4899", "#8B5CF6"],
    gravity: 0.8,
  });

  // Multiple bursts from different positions
  setTimeout(() => {
    confetti({
      particleCount: 150,
      angle: 90,
      spread: 80,
      startVelocity: 55,
      origin: { x: 0.3, y: 0 },
      colors: ["#2563EB", "#7C3AED", "#10B981", "#F59E0B"],
    });
    confetti({
      particleCount: 150,
      angle: 90,
      spread: 80,
      startVelocity: 55,
      origin: { x: 0.7, y: 0 },
      colors: ["#EF4444", "#EC4899", "#8B5CF6", "#0EA5E9"],
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 360,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.2 },
      colors: ["#2563EB", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"],
      scalar: 1.3,
    });
  }, 400);

  // Long running confetti from top
  confettiFullPage(6000);
}


