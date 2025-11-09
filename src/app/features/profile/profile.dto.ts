import { t } from "elysia";

// This is the validation schema for updating a profile.
// We'll use this in the ProfileRouter.
export const UpdateProfileSchema = t.Object({
  bio: t.Optional(t.String({ maxLength: 500 })),
  interests: t.Optional(t.Array(t.String(), { maxItems: 10 })),
  photo_urls: t.Optional(t.Array(t.String({ format: "uri" }), { minItems: 1, maxItems: 6 })),
  silhouette_url: t.Optional(t.String({ format: "uri" })),
});

export type UpdateProfileDto = typeof UpdateProfileSchema.static;