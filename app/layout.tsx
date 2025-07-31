"use client"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import UserAuthHandler from "@/middlewares/userAuthorization";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "../toolkits/user-toolkit";
import PartnerReducer from "../toolkits/ProductsSlicer";
import NextTopLoader from 'nextjs-toploader';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const store = configureStore({
  reducer: {
    user: UserReducer,
    partner: PartnerReducer,
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>S-Market</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Provider store={store}>
          <NextTopLoader showSpinner={false}  />
            {children}
            <UserAuthHandler />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
