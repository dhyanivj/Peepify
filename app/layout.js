import "./globals.css";

export const metadata = {
  title: "Peepify - Hand-Drawn Open Peeps Avatar Generator",
  description: "Turn your photos into beautiful hand-drawn doodle caricatures in Pablo Stanley's signature Open Peeps illustration style!",
  keywords: ["Open Peeps", "Doodle Generator", "Avatar Creator", "Pablo Stanley", "Vijay Dhyani", "Vertex AI", "Gemini 2.5 Flash", "Imagen 3", "Caricature Maker"],
  authors: [{ name: "Vijay Dhyani" }],
  openGraph: {
    title: "Peepify - Hand-Drawn Open Peeps Avatar Generator",
    description: "Turn your photos into beautiful hand-drawn doodle caricatures in Pablo Stanley's signature Open Peeps style!",
    url: "https://peppify.dhyani.site",
    siteName: "Peepify",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Peepify - Hand-Drawn Open Peeps Avatar Generator",
    description: "Turn your photos into beautiful hand-drawn doodle caricatures in Pablo Stanley's signature Open Peeps style!",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
