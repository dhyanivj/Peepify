import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://peppify.dhyani.site"),
  title: "Peepify - Hand Drawn Open Peeps Avatar Generator",
  description: "Turn your photos into beautiful hand drawn doodle caricatures in Pablo Stanley's signature Open Peeps illustration style!",
  keywords: ["Open Peeps", "Doodle Generator", "Avatar Creator", "Pablo Stanley", "Vijay Dhyani", "Vertex AI", "Gemini 2.5 Flash", "Imagen 3", "Caricature Maker"],
  authors: [{ name: "Vijay Dhyani" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Peepify",
    "description": "Turn your photos into beautiful hand drawn doodle caricatures in Pablo Stanley's signature Open Peeps illustration style!",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "url": "https://peppify.dhyani.site",
    "image": "https://i.ibb.co/0jwn6Vk9/Gemini-Generated-Image-t6vdhyt6vdhyt6vd-1.png",
    "author": {
      "@type": "Person",
      "name": "Vijay Dhyani"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
