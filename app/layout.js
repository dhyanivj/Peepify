import "./globals.css";

export const metadata = {
  title: "Peepify - Hand Drawn Open Peeps Avatar Generator",
  description: "Turn your photos into beautiful hand drawn doodle caricatures in Pablo Stanley's signature Open Peeps illustration style!",
  keywords: ["Open Peeps", "Doodle Generator", "Avatar Creator", "Pablo Stanley", "Vijay Dhyani", "Vertex AI", "Gemini 2.5 Flash", "Imagen 3", "Caricature Maker"],
  authors: [{ name: "Vijay Dhyani" }],
  openGraph: {
    title: "Peepify - Hand Drawn Open Peeps Avatar Generator",
    description: "Turn your photos into beautiful hand drawn doodle caricatures in Pablo Stanley's signature Open Peeps style!",
    url: "https://peppify.dhyani.site",
    siteName: "Peepify",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://i.ibb.co/0jwn6Vk9/Gemini-Generated-Image-t6vdhyt6vdhyt6vd-1.png",
        width: 1200,
        height: 630,
        alt: "Peepify - Hand Drawn Open Peeps Avatar Generator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peepify - Hand Drawn Open Peeps Avatar Generator",
    description: "Turn your photos into beautiful hand drawn doodle caricatures in Pablo Stanley's signature Open Peeps style!",
    images: ["https://i.ibb.co/0jwn6Vk9/Gemini-Generated-Image-t6vdhyt6vdhyt6vd-1.png"],
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
