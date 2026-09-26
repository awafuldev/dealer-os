export interface PublicVehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string | null;
  bodyType: string | null;
  description: string | null;
  status: "DISPONIBLE" | "RESERVADO" | "VENDIDO";
  vin: string | null; // ya viene null si vinPublic es false
  featuredOnHome: boolean;
  images: string[];
  coverImage: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80";

/**
 * Convierte un vehículo de Prisma (con sus imágenes) en el shape público
 * seguro para el showroom. Nunca incluye purchasePrice, gastos, margen o ROI.
 */
export function toPublicVehicle(v: {
  id: string;
  slug: string | null;
  brand: string;
  model: string;
  year: number;
  salePrice: number;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string | null;
  bodyType: string | null;
  description: string | null;
  status: string;
  vin: string | null;
  vinPublic: boolean;
  featuredOnHome: boolean;
  images: { url: string; isCover: boolean }[];
}): PublicVehicle {
  const sortedImages = [...v.images].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0));
  const imageUrls = sortedImages.map((i) => i.url);

  return {
    id: v.id,
    slug: v.slug || v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    price: v.salePrice,
    mileage: v.mileage,
    transmission: v.transmission,
    fuel: v.fuel,
    color: v.color,
    bodyType: v.bodyType,
    description: v.description,
    status: v.status as PublicVehicle["status"],
    vin: v.vinPublic ? v.vin : null,
    featuredOnHome: v.featuredOnHome,
    images: imageUrls.length > 0 ? imageUrls : [FALLBACK_IMAGE],
    coverImage: imageUrls[0] || FALLBACK_IMAGE,
  };
}
