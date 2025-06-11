export const metadata = {
  title: 'ANotatki',
  description: 'ANotatki są najlepsze!',
  icons: {
    icon: '/favicon.png',
  },
}

import ToastProvider from "@/app/components/toastProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
