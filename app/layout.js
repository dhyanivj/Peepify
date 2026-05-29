import "./globals.css";

export const metadata = {
  title: "Imagen Studio | Material 3 Image Generation",
  description: "Create stunning, high-fidelity images using Google's state-of-the-art Imagen 3 model on Vertex AI, wrapped in a premium Material 3 design system.",
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
