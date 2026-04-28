import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Nova Reminders - AI-Powered Reminder App",
  description: "A beautiful reminder app with Nova AI assistant. Stay organized with smart reminders and notifications.",
  keywords: ["Nova", "Reminders", "AI", "Task Manager", "Productivity"],
  authors: [{ name: "Nova Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-[#07080F] text-[#F0F2FF] min-h-screen">
        <ServiceWorkerRegistration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
