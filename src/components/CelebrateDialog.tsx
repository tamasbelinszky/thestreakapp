"use client";

import { useConfetti } from "@/hooks/useConfetti";
import React, { useState } from "react";

export const CelebrateDialog: React.FC = () => {
  const { confetti } = useConfetti();

  return (
    <section className="confetti">
      <button onClick={confetti}>Celebrate!</button>
    </section>
  );
};
