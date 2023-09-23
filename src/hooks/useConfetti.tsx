import JSConfetti from "js-confetti";
import { useEffect, useRef } from "react";

export function useConfetti() {
  const jsConfetti = useRef<any>(null);

  function confetti() {
    const commonOptions = {
      confettiRadius: 8,
      confettiNumber: 72,
    };

    jsConfetti.current.addConfetti({
      ...commonOptions,
      confettiColors: ["#ff3838", "#ff9d00", "#fffb00", "#48ff00", "#00ffd5", "#0090ff", "#7e00ff"],
    });
    jsConfetti.current.addConfetti({
      ...commonOptions,
      emojis: ["🏆"],
      emojiSize: 25,
    });
  }

  useEffect(() => {
    jsConfetti.current = new JSConfetti();
  }, []);

  return { confetti };
}
