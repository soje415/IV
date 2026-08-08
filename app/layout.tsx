import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/motion-provider";
import { CELEBRANTS, EVENT } from "@/config/event";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const title = `${CELEBRANTS.tabitha.firstName} & ${CELEBRANTS.abraham.firstName}'s Birthday`;
const description = `One party, two birthdays. ${CELEBRANTS.tabitha.firstName} is turning ${CELEBRANTS.tabitha.turning} and ${CELEBRANTS.abraham.firstName} is turning ${CELEBRANTS.abraham.turning}. RSVP for your family pass.`;

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.siteUrl),
  title,
  description,
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#140d24",
  // Lets the page paint under the notch; safe-area padding handles the rest.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
