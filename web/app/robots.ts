import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/agent/",
          "/admin/",
          "/api/",
          "/chat/*/",        // Block individual session URLs
          "/call/*/",        // Block individual call session URLs
          "/login",
          "/register",
          "/dashboard",
          "/booking/",
          "/documents/",
          "/create-traveler-profile",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/agent/",
          "/admin/",
          "/api/",
          "/chat/[^/]*/",
          "/call/[^/]*/",
          "/login",
          "/register",
          "/booking/",
          "/documents/",
        ],
      },
    ],
    sitemap: "https://www.zenivatravel.com/sitemap.xml",
    host: "https://www.zenivatravel.com",
  };
}
