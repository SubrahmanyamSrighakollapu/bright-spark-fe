import {
  BLOG_POSTS,
  DESTINATIONS,
  HOTELS,
  PACKAGES,
  REVIEWS,
  TOURS,
} from "@/lib/marketing/data/mock";
import { slugify } from "@/lib/marketing/utils";

export function getPackageById(id: string) {
  return PACKAGES.find((pkg) => pkg.id === id);
}

export function getHotelById(id: string) {
  return HOTELS.find((hotel) => hotel.id === id);
}

export function getTourById(id: string) {
  return TOURS.find((tour) => tour.id === id);
}

export function getDestinationBySlug(slug: string) {
  return DESTINATIONS.find((destination) => {
    const nameSlug = slugify(destination.name);
    const compoundSlug = slugify(`${destination.name}-${destination.country}`);
    return destination.id === slug || nameSlug === slug || compoundSlug === slug;
  });
}

export function getBlogBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getDestinationPackages(destinationName: string) {
  return PACKAGES.filter((pkg) =>
    pkg.destination.toLowerCase().includes(destinationName.toLowerCase())
  );
}

export function getDestinationHotels(destinationName: string) {
  return HOTELS.filter((hotel) =>
    `${hotel.city} ${hotel.country} ${hotel.location}`
      .toLowerCase()
      .includes(destinationName.toLowerCase())
  );
}

export function getDestinationTours(destinationName: string) {
  return TOURS.filter((tour) =>
    tour.destination.toLowerCase().includes(destinationName.toLowerCase())
  );
}

export function getRelatedReviews(term: string) {
  return REVIEWS.filter((review) =>
    (review.destination || "").toLowerCase().includes(term.toLowerCase())
  );
}

export function buildBlogSections(
  title: string,
  excerpt: string,
  tags: string[]
) {
  return [
    {
      heading: "Why This Matters",
      body: `${excerpt} We shaped this guide around the kind of decisions travelers actually make when they are comparing destinations, budgets, travel windows, and on-the-ground experiences.`,
    },
    {
      heading: "What To Focus On",
      body: `Start with the essentials: seasonality, neighborhood or region choice, typical daily pace, and the experiences that feel most worth your time. For ${tags.join(
        ", "
      )}, the best itineraries are usually the ones that leave room for both signature moments and slower local discovery.`,
    },
    {
      heading: "Bright Spark Travel Take",
      body: `Our editorial team would position "${title}" as a high-intent planning read: enough inspiration to spark a booking, paired with practical guidance you can act on right away. That balance is what makes premium travel content genuinely useful instead of just aspirational.`,
    },
  ];
}
