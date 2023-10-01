export const metadata = {
  title: "Chat With Andrew Huberman about goals",
  description:
    "The science of goal setting with Andrew Huberman. Set and achieve your goals with the help of a professional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen w-full justify-center">{children}</div>;
}
