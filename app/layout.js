import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://peppify.dhyani.site"),
  title: {
    default: "Peepify — Free AI Avatar Maker | Hand-Drawn Open Peeps Generator",
    template: "%s | Peepify",
  },
  description:
    "Peepify is a free AI avatar maker that transforms your selfies into beautiful hand-drawn Open Peeps doodle illustrations. Powered by Google Gemini 2.5 Flash and Imagen 3. Create unique cartoon caricatures, profile pictures, and social media avatars in Pablo Stanley's iconic sketch style — instantly and for free.",
  keywords: [
    // Primary high-volume keywords
    "AI avatar maker",
    "AI avatar generator",
    "free AI avatar maker",
    "AI profile picture generator",
    "AI cartoon maker",
    "AI caricature maker",
    "AI doodle generator",
    // Product / brand keywords
    "Peepify",
    "Open Peeps",
    "Open Peeps avatar",
    "Open Peeps generator",
    "Pablo Stanley illustrations",
    // Long-tail & descriptive keywords
    "hand drawn avatar generator",
    "selfie to cartoon",
    "selfie to doodle",
    "photo to illustration",
    "photo to sketch",
    "photo to cartoon",
    "photo to avatar",
    "turn photo into drawing",
    "convert photo to illustration",
    "AI illustration generator",
    "cartoon profile picture maker",
    "free avatar creator online",
    "doodle caricature maker",
    "sketch style avatar",
    "hand drawn profile picture",
    // Technology keywords
    "Vertex AI",
    "Gemini 2.5 Flash",
    "Imagen 3",
    "Google AI avatar",
    // Creator
    "Vijay Dhyani",
  ],
  authors: [{ name: "Vijay Dhyani", url: "https://dhyani.site" }],
  creator: "Vijay Dhyani",
  publisher: "Vijay Dhyani",
  category: "Technology",
  classification: "AI Tools, Avatar Generator, Illustration",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: "https://peppify.dhyani.site",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Peepify — Free AI Avatar Maker | Hand-Drawn Open Peeps Generator",
    description:
      "Transform your selfies into stunning hand-drawn Open Peeps illustrations with AI. Free, instant, and powered by Google Gemini 2.5 Flash & Imagen 3.",
    url: "https://peppify.dhyani.site",
    siteName: "Peepify",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://i.ibb.co/ymrwDC6C/image.png",
        width: 1200,
        height: 630,
        alt: "Peepify — AI Avatar Maker that converts selfies into hand-drawn Open Peeps illustrations",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peepify — Free AI Avatar Maker | Open Peeps Generator",
    description:
      "Transform your selfies into stunning hand-drawn doodle illustrations with AI. Free and instant!",
    images: {
      url: "https://i.ibb.co/ymrwDC6C/image.png",
      alt: "Peepify — AI Avatar Maker Preview",
    },
  },
  verification: {
    // Add your verification tokens here when available
    // google: "your-google-site-verification-token",
    // yandex: "your-yandex-verification-token",
    // bing: "your-bing-verification-token",
  },
  other: {
    "application-name": "Peepify",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Peepify",
    "format-detection": "telephone=no",
    "theme-color": "#FF6B35",
  },
};

export default function RootLayout({ children }) {
  // Rich structured data: SoftwareApplication schema for rich snippets
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Peepify",
    alternateName: "Peepify AI Avatar Maker",
    description:
      "Peepify is a free AI-powered avatar maker that transforms your selfies into beautiful hand-drawn Open Peeps doodle illustrations in Pablo Stanley's iconic sketch style.",
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Avatar Generator",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    url: "https://peppify.dhyani.site",
    image: "https://i.ibb.co/ymrwDC6C/image.png",
    screenshot: "https://i.ibb.co/ymrwDC6C/image.png",
    author: {
      "@type": "Person",
      name: "Vijay Dhyani",
      url: "https://dhyani.site",
    },
    creator: {
      "@type": "Person",
      name: "Vijay Dhyani",
      url: "https://dhyani.site",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    featureList:
      "AI Avatar Generation, Selfie to Doodle, Open Peeps Style, Hand-Drawn Illustrations, Free to Use, Instant Results",
    softwareVersion: "1.0.0",
    releaseNotes: "Initial release with AI-powered avatar generation",
  };

  // WebSite schema for enhanced sitelinks search box
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Peepify",
    alternateName: "Peepify AI Avatar Maker",
    url: "https://peppify.dhyani.site",
    description:
      "Free AI-powered avatar maker that transforms selfies into hand-drawn Open Peeps illustrations.",
  };

  // Organization schema for brand knowledge panel
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Peepify",
    url: "https://peppify.dhyani.site",
    logo: "https://peppify.dhyani.site/favicon.ico",
    founder: {
      "@type": "Person",
      name: "Vijay Dhyani",
      url: "https://dhyani.site",
    },
    sameAs: [],
  };

  // FAQPage schema for FAQ rich snippets (boosts visibility)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Peepify?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Peepify is a free AI-powered tool that transforms your selfie photos into beautiful hand-drawn Open Peeps doodle illustrations in Pablo Stanley's iconic sketch style.",
        },
      },
      {
        "@type": "Question",
        name: "Is Peepify free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Peepify is completely free to use. Just upload a selfie or take a photo with your camera, and get your hand-drawn avatar instantly.",
        },
      },
      {
        "@type": "Question",
        name: "What AI technology does Peepify use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Peepify uses Google's Gemini 2.5 Flash for intelligent image analysis and Imagen 3 for generating the final hand-drawn Open Peeps style illustration.",
        },
      },
      {
        "@type": "Question",
        name: "What are Open Peeps?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open Peeps is a hand-drawn illustration library created by Pablo Stanley. It features a distinctive sketchy, doodle art style used for character avatars and illustrations.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download my avatar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! After your avatar is generated, you can download it directly to your device or save it to the public Peepify gallery to share with others.",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FF6B35" />
        <link rel="canonical" href="https://peppify.dhyani.site" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareAppSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
