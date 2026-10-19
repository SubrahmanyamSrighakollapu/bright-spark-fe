import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Tag } from "lucide-react";
import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { BLOG_POSTS } from "@/lib/marketing/data/mock";
import { buildBlogSections, getBlogBySlug } from "@/lib/marketing/data/route-helpers";
import { formatDate } from "@/lib/marketing/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) return { title: "Article Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) notFound();

  const sections = buildBlogSections(post.title, post.excerpt, post.tags);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1 bg-slate-50 pt-20 dark:bg-slate-950">
        <article className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to articles
          </Link>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <img src={post.image} alt={post.title} className="h-[320px] w-full object-cover sm:h-[420px]" />

            <div className="p-6 sm:p-10">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                  {post.category}
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                {post.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar} alt={post.author} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{post.author}</p>
                    <p>{formatDate(post.date)}</p>
                  </div>
                </div>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {post.readTime}
                </span>
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Editorial guide
                </span>
              </div>

              <p className="mt-8 text-lg leading-8 text-slate-600 dark:text-slate-300">
                {post.excerpt}
              </p>

              <div className="mt-10 space-y-10">
                {sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {section.heading}
                    </h2>
                    <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
