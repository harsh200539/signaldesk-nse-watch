import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "SignalDesk | NSE Filing Watch", description: "Track NSE company filings and review source grounded research notes.", robots: { index: false, follow: false } };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
