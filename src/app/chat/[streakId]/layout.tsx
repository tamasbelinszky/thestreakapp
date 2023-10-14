export const metadata = {
  title: "Chat with an AI your about goals",
  description: "The science of goal setting with an AI chatbot. Set and achieve goals with the help of a professional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen w-full justify-center py-2">{children}</div>;
}
