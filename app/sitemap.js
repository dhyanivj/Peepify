export default async function sitemap() {
  const baseUrl = "https://peppify.dhyani.site";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3, // Low priority since it's passcode-protected
    },
  ];
}
