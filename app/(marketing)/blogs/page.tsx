import { Navbar } from "@/components/marketing/layout/navbar";
import { Footer } from "@/components/marketing/layout/footer";
import { BlogsContent } from "@/components/marketing/shared/blogs-content";

export const metadata = { title: "Travel Blog — Stories, Tips & Inspiration" };

export default function BlogsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        <BlogsContent />
      </main>
      <Footer />
    </>
  );
}

