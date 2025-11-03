import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { ThemeInitializer } from "@/components/ThemeInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker Pro",
  description: "Track your expenses and manage your budget efficiently",
  keywords: ["expense tracker", "budget management", "personal finance", "money management"],
  openGraph: {
    title: "Expense Tracker Pro",
    description: "Track your expenses and manage your budget efficiently",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expense Tracker Pro",
    description: "Track your expenses and manage your budget efficiently",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme') || 'light';
                  const htmlElement = document.documentElement;
                  const root = document.documentElement;
                  
                  console.log('Theme init script running, savedTheme:', savedTheme);
                  
                  htmlElement.classList.remove('dark', 'light-theme', 'dark-theme');
                  
                  if (savedTheme === 'dark') {
                    htmlElement.classList.add('dark', 'dark-theme');
                    htmlElement.style.backgroundColor = '#0f172a';
                    htmlElement.style.color = '#f1f5f9';
                    if (document.body) {
                      document.body.style.backgroundColor = '#0f172a';
                      document.body.style.color = '#f1f5f9';
                    }
                    console.log('Applied dark theme');
                  } else {
                    htmlElement.classList.add('light-theme');
                    htmlElement.style.backgroundColor = '#ffffff';
                    htmlElement.style.color = '#1E1E21';
                    if (document.body) {
                      document.body.style.backgroundColor = '#ffffff';
                      document.body.style.color = '#1E1E21';
                    }
                    root.style.setProperty('--background', '#ffffff');
                    root.style.setProperty('--foreground', '#1E1E21');
                    root.style.setProperty('--card', '#ffffff');
                    root.style.setProperty('--card-foreground', '#1E1E21');
                    root.style.setProperty('--primary', '#1E5F74');
                    root.style.setProperty('--secondary', '#55CCA1');
                    root.style.setProperty('--muted', '#f9fafb');
                    root.style.setProperty('--muted-foreground', '#4a5568');
                    root.style.setProperty('--accent', '#B2B5E0');
                    root.style.setProperty('--success', '#2EB873');
                    root.style.setProperty('--destructive', '#E57373');
                    root.style.setProperty('--border', '#e5e7eb');
                    console.log('Applied light theme');
                  }
                } catch (e) {
                  console.error('Error initializing theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CurrencyProvider>
          <ThemeInitializer />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
