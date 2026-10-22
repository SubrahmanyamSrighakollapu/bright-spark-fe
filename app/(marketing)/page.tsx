import { redirect } from "next/navigation";

// Previous marketing homepage retained for future use:
//
// import { Navbar } from "@/components/marketing/layout/navbar";
// import { Footer } from "@/components/marketing/layout/footer";
// import { HeroSection } from "@/components/marketing/home/hero-section";
// import { TrendingDestinations } from "@/components/marketing/home/trending-destinations";
// import { FeaturedPackages } from "@/components/marketing/home/featured-packages";
// import { FlashDeals } from "@/components/marketing/home/flash-deals";
// import { StatsSection } from "@/components/marketing/home/stats-section";
// import { ReviewsSection } from "@/components/marketing/home/reviews-section";
// import { BlogSection } from "@/components/marketing/home/blog-section";
// import { AiPlannerCTA } from "@/components/marketing/home/ai-planner-cta";
// import { HotelsSection } from "@/components/marketing/home/hotels-section";
// import { PartnersSection } from "@/components/marketing/home/partners-section";
//
// function MarketingHomePage() {
//   return (
//     <>
//       <Navbar />
//       <main className="flex-1">
//         <HeroSection />
//         <TrendingDestinations />
//         <FeaturedPackages />
//         <FlashDeals />
//         <HotelsSection />
//         <StatsSection />
//         <AiPlannerCTA />
//         <ReviewsSection />
//         <BlogSection />
//         <PartnersSection />
//       </main>
//       <Footer />
//     </>
//   );
// }

export default function HomePage() {
  redirect("/login");
}
