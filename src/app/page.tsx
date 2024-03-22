"use client";

import { FeatureCard, features } from "@/components/FeatureCard";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 p-2 lg:gap-24 lg:p-4">
      <header className="flex w-full items-center justify-between bg-background p-4">
        <Link href={"#"}>
          <Image
            src={"/thestreakapp-icon.png"}
            width={64}
            height={64}
            alt="thestreakapp_icon"
            className="hover:animate-spin"
          />
        </Link>
        <nav>
          <ul className="flex items-end gap-2">
            <li>
              <Link
                href={"/login"}
                className={buttonVariants({
                  variant: "secondary",
                })}
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link href={"/login"} className={buttonVariants()}>
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <section className="mt-8 flex flex-col items-center justify-center gap-4 lg:mt-24 lg:flex-row lg:justify-between">
        <div className="flex flex-col justify-around gap-2 text-center md:h-[300px] md:w-1/2 md:text-left">
          <h1 className="hidden text-4xl font-extrabold sm:block md:text-5xl">TheStreakApp</h1>
          <h2 className="text-2xl font-extrabold lg:font-semibold">Set and achieve goals.</h2>
          <p className="text-lg">Create streaks and track your progress. How long can you go?</p>

          <Link href={"/login"} className={buttonVariants({ className: "w-full" })}>
            Get Started
          </Link>
        </div>
        <div className="mt-12 w-full md:w-1/2 lg:mt-0">
          <Image
            src="/thestreakapp-hero.png"
            alt="The Streak App Hero"
            width={500}
            height={300}
            className="rounded-xl object-cover"
          />
        </div>
      </section>

      <section id="features" className="mt-12 flex flex-col gap-4 lg:mt-24 lg:gap-8">
        <h2 className="text-center text-3xl font-bold">Features</h2>
        <div className="flex flex-col gap-2 lg:gap-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:gap-4">
            {features.slice(0, 2).map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:gap-12">
            {features.slice(2).map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-12 flex  min-h-[50px] w-screen items-center justify-center gap-4 bg-gray-100 text-center lg:mt-24 lg:gap-8">
        <p className="text-gray-600">© 2023 The Streak App - All rights reserved.</p>
      </footer>
    </div>
  );
}
