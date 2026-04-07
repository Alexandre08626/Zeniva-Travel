import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS } from "../posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://www.zenivatravel.com/blog/${post.slug}`,
      type: "article",
      images: [{ url: post.heroImage, width: 1600, height: 900 }],
    },
    alternates: {
      canonical: `https://www.zenivatravel.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.heroImage,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Zeniva Travel",
      url: "https://www.zenivatravel.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.zenivatravel.com/logo.png",
      },
    },
    description: post.metaDescription,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.zenivatravel.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 20px 80px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Hero */}
        <div
          style={{
            width: "100vw",
            marginLeft: "calc(-50vw + 50%)",
            height: 420,
            backgroundImage: `linear-gradient(to bottom, rgba(11,27,77,0.25), rgba(11,27,77,0.6)), url(${post.heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              maxWidth: 800,
              width: "100%",
              padding: "0 20px 40px",
            }}
          >
            <h1
              style={{
                fontSize: 38,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 12,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {post.title}
            </h1>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <time
                style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}
                dateTime={post.date}
              >
                {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                &middot;
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                {post.author}
              </span>
            </div>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/blog"
          style={{
            display: "inline-block",
            fontSize: 14,
            color: "#0F6CF5",
            textDecoration: "none",
            marginBottom: 32,
            fontWeight: 500,
          }}
        >
          &larr; Back to Blog
        </Link>

        {/* Article content */}
        <article
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            fontSize: 17,
            lineHeight: 1.8,
            color: "#333",
          }}
        />

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {post.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#0F6CF5",
                background: "rgba(15,108,245,0.08)",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>

        {/* Related links */}
        {post.relatedLinks.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3
              style={{ fontSize: 16, fontWeight: 700, color: "#0B1B4D", marginBottom: 12 }}
            >
              Related
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {post.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: 14,
                    color: "#0F6CF5",
                    textDecoration: "none",
                    padding: "6px 16px",
                    border: "1px solid rgba(15,108,245,0.25)",
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: 48,
            padding: "32px 28px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            Ready to Plan Your Trip?
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 20,
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Chat with Lina, our AI travel agent, for personalized
            recommendations and real-time pricing. No fees, no pressure.
          </p>
          <Link
            href="/chat"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "#E6B85A",
              color: "#0B1B4D",
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Chat with Lina
          </Link>
        </div>
      </main>

      {/* Global article styles */}
      <style>{`
        article h2 { font-size: 26px; font-weight: 700; color: #0B1B4D; margin-top: 36px; margin-bottom: 12px; }
        article h3 { font-size: 20px; font-weight: 600; color: #0B1B4D; margin-top: 28px; margin-bottom: 8px; }
        article p { margin-bottom: 16px; }
        article ul { margin-bottom: 16px; padding-left: 24px; }
        article li { margin-bottom: 8px; }
        article a { color: #0F6CF5; text-decoration: underline; }
        article strong { color: #0B1B4D; }
      `}</style>
    </>
  );
}
