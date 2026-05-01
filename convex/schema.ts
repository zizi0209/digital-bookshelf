import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tác phẩm chính thức của Tsukizoe
  books: defineTable({
    title: v.string(),
    description: v.string(),
    genre: v.string(),
    coverUrl: v.optional(v.string()),
    pages: v.array(v.string()),
    isFeatured: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_genre", ["genre"]),

  // Phòng trưng bày cộng đồng (đọc giả gửi)
  gallery: defineTable({
    title: v.string(),
    authorName: v.string(),
    authorEmail: v.string(),
    description: v.string(),
    genre: v.string(),
    coverUrl: v.optional(v.string()),
    pages: v.array(v.string()),
    status: v.string(), // "pending" | "approved" | "rejected"
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_author", ["authorEmail"]),
});
