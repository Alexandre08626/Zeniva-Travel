import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "./posts";

export const metadata: Metadata = {
  title: "Travel Blog — Tips, Guides & Deals | Zeniva",
  description:
    "Expert travel tips, destination guides, and exclusive deals. Plan smarter trips with insights from Zeniva's AI-powered travel team.",
  openGraph: {
    title: "Zeniva Travel Blog",
    description:
      "Expert travel tips, destination guides, and exclusive deals from Zeniva.",
    url: "https://www.zenivatravel.com/blog",
  },
  alternates: { canonical: "https://www.zenivatravel.com/blog" },
};

export default function BlogPage() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "48px 20px 80px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: "#0B1B4D",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Zeniva Travel Blog
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "#555",
          textAlign: "center",
          marginBottom: 48,
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Expert tips, destination guides, and insights to help you plan your
        perfect trip.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 32,
        }}
      >
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(11,27,77,0.10)",
                transition: "transform 0.2s, box-shadow 0.2s",
                background: "#fff",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 200,
                  backgroundImage: `url(${post.heroImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ padding: "20px 24px 24px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#0F6CF5",
                        background: "rgba(15,108,245,0.08)",
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {tag.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0B1B4D",
                    marginBottom: 8,
                    lineHeight: 1.3,
                  }}
                >
                  {post.title}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {post.excerpt}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <time
                    style={{ fontSize: 13, color: "#999" }}
                    dateTime={post.date}
                  >
                    {new Date(post.date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </time>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#E6B85A",
                    }}
                  >
                    Read more &rarr;
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}
