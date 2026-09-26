/**
 * Slug utilities for clean public vehicle URLs, e.g. /vehiculos/toyota-rav4-2023
 */

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildVehicleSlugBase(brand: string, model: string, year: number): string {
  return slugify(`${brand}-${model}-${year}`);
}

/** Short, human-tolerable random suffix used to break slug collisions. */
export function randomSlugSuffix(): string {
  return Date.now().toString(36).slice(-5);
}
