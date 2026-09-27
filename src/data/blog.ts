export interface Blog {
  title: string;
  description: string;
  content: string;
  tags: string[];
  date: string;
  readTime: string;
  pinned?: boolean;
}

const blogFiles = import.meta.glob("./blogs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const blogs: Blog[] = Object.values(blogFiles)
  .map((file) => {
    const match = file.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { title: "Untitled", description: "", tags: [], date: "1970-01-01", readTime: "1 min read", content: file };

    const frontmatterStr = match[1];
    const content = match[2];
    const data: Record<string, any> = {};

    frontmatterStr.split("\n").forEach(line => {
      const splitIndex = line.indexOf(":");
      if (splitIndex === -1) return;
      const key = line.slice(0, splitIndex).trim();
      let value: any = line.slice(splitIndex + 1).trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        value = value.slice(1, -1).split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      } else if (value === "true" || value === "false") {
        value = value === "true";
      } else {
        value = value.replace(/^"|"$/g, "");
      }
      data[key] = value;
    });

    return {
      title: data.title || "Untitled",
      description: data.description || "",
      tags: data.tags || [],
      date: data.date || "1970-01-01",
      readTime: data.readTime || "1 min read",
      pinned: data.pinned || false,
      content: content,
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
