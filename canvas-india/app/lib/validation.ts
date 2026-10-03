import { z } from "zod";

export const CATEGORIES = [
  "Canvas",
  "Acrylic",
  "Posters",
  "Cork / Yoga & Wellness",
  "Fitness",
  "Home Decor",
  "Custom Prints",
  "Gifts",
] as const;

export const SHAPES = [
  "Popular",
  "Square",
  "Rectangle",
  "Panoramic",
  "Circle",
  "Triangle",
  "Custom",
] as const;

export const MATERIALS = [
  "Acrylic",
  "Canvas Pettu",
] as const;

export const FINISHES = [
  "Print Only (Rolled)",
  "Matte Gallery Wrap",
  "Satin Lustre",
  "Matte Black Wood Frame",
  "Teak Wood Frame",
  "White Floating Frame",
  "Unframed",
] as const;

const SHAPE_CATEGORIES = ["Canvas", "Acrylic"] as const;

const urlSchema = z
  .string()
  .url("Must be a valid URL")
  .min(1, "Image URL is required");

export const variantSchema = z.object({
  shape: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v || null),
  size: z.string().min(1, "Size is required"),
  material: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v || null),
  finish: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v || null),
  price: z
    .number("Price must be a number")
    .nonnegative("Price must be ≥ 0"),
  compareAtPrice: z
    .number("Compare-at price must be a number")
    .nonnegative("Compare-at price must be ≥ 0")
    .optional()
    .nullable(),
  startingStock: z
    .number("Stock must be a whole number")
    .int("Stock must be a whole number")
    .nonnegative("Stock must be ≥ 0"),
});

// z.enum in Zod v4 requires a plain array, not readonly tuple — use z.union of literals instead
const categorySchema = z
  .string()
  .refine(
    (v): v is (typeof CATEGORIES)[number] =>
      (CATEGORIES as readonly string[]).includes(v),
    { message: "Please select a valid category" }
  );

export const submitSchema = z
  .object({
    productCode: z.string().min(1, "Product code is required"),
    productName: z.string().min(1, "Product name is required"),
    category: categorySchema,
    description: z
      .string()
      .optional()
      .nullable()
      .transform((v) => v || null),
    mainImageUrl: urlSchema,
    additionalImageUrls: z
      .string()
      .optional()
      .nullable()
      .transform((v) => v || null),
    variants: z
      .array(variantSchema)
      .min(1, "At least one size/variant is required"),
  })
  .superRefine((data, ctx) => {
    data.variants.forEach((variant, i) => {
      if (
        SHAPE_CATEGORIES.includes(
          data.category as (typeof SHAPE_CATEGORIES)[number]
        ) &&
        variant.shape &&
        !(SHAPES as readonly string[]).includes(variant.shape)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Variant ${i + 1}: Invalid shape value`,
          path: ["variants", i, "shape"],
        });
      }
      if (
        variant.material &&
        !(MATERIALS as readonly string[]).includes(variant.material)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Variant ${i + 1}: Invalid material value`,
          path: ["variants", i, "material"],
        });
      }
      if (
        variant.finish &&
        !(FINISHES as readonly string[]).includes(variant.finish)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Variant ${i + 1}: Invalid finish value`,
          path: ["variants", i, "finish"],
        });
      }
    });
  });

export type SubmitInput = z.infer<typeof submitSchema>;
