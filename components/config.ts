export const config = {
  appUrl:
    process.env.NODE_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL ??
        process.env.NEXT_PUBLIC_APP_URL!
      : "localhost:3000",
  social: {
    website: "https://heavenkeys.ca",
    email: "info@heavenkeys.ca",
  },
  company: {
    name: "HeavenKeys Ltd",
    description: "Gospel Music Chords & Resources",
    founded: "2024",
  },
};
