export default async function sitemap() {
  const baseUrl = "https://peppify.dhyani.site";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    // /dashboard is deliberately excluded — it's a passcode-protected admin panel
    // and should NOT be indexed by search engines.
  ];
}
