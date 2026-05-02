import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listApproved = query({
  args: { genre: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("gallery")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .collect();
    if (args.genre) return all.filter((b) => b.genre === args.genre);
    return all;
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("gallery").withIndex("by_status", (q) => q.eq("status", "pending")).order("desc").collect(),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("gallery").order("desc").collect(),
});

// Lọc theo status + search theo tiêu đề / tên tác giả
export const listFiltered = query({
  args: {
    status: v.optional(v.string()), // "pending" | "approved" | "rejected" | undefined (all)
    search: v.optional(v.string()),
  },
  handler: async (ctx, { status, search }) => {
    let items = status
      ? await ctx.db.query("gallery").withIndex("by_status", (q) => q.eq("status", status)).order("desc").collect()
      : await ctx.db.query("gallery").order("desc").collect();
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (b) => b.title.toLowerCase().includes(q) || b.authorName.toLowerCase().includes(q),
      );
    }
    return items;
  },
});

export const get = query({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => ctx.storage.getUrl(storageId),
});

export const submit = mutation({
  args: {
    title: v.string(),
    authorName: v.string(),
    authorEmail: v.string(),
    description: v.string(),
    genre: v.string(),
    fileStorageId: v.optional(v.string()),
    fileType: v.optional(v.string()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("gallery", { ...args, status: "pending", createdAt: Date.now() }),
});

export const approve = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: "approved" }),
});

export const reject = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: "rejected" }),
});

export const remove = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
