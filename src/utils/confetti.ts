import confetti from 'canvas-confetti';

export function triggerAssertiveCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // confetti from two sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#6366f1', '#10b981', '#38bdf8', '#f59e0b', '#ec4899'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.8, y: 0.6 },
      colors: ['#6366f1', '#10b981', '#38bdf8', '#f59e0b', '#ec4899'],
    });
  }, 250);
}
