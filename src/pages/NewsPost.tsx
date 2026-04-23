import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NewsCategoriesSidebar from "@/components/NewsCategoriesSidebar";
import {
  CalendarDays,
  ChevronLeft,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";

type Post = {
  id: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  video_url: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  external_link: string | null;
  published_at: string;
  category_id: string;
};

type Category = { id: string; key: string; title: string };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Convert YouTube/Vimeo URLs to embeddable form
function toEmbedUrl(url: string): { type: "iframe" | "video"; src: string } {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return { type: "iframe", src: `https://www.youtube.com/embed/${u.searchParams.get("v")}` };
    }
    if (u.hostname === "youtu.be") {
      return { type: "iframe", src: `https://www.youtube.com/embed${u.pathname}` };
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return { type: "iframe", src: `https://player.vimeo.com/video/${id}` };
    }
  } catch {
    /* ignore */
  }
  return { type: "video", src: url };
}

function isPdf(url: string) {
  return /\.pdf(\?|$)/i.test(url);
}

function isImage(url: string) {
  return /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(url);
}

export default function NewsPost() {
  const { categoryKey, postId } = useParams<{ categoryKey: string; postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .eq("id", postId)
        .eq("is_published", true)
        .maybeSingle();
      setPost((data as Post) ?? null);

      if (data?.category_id) {
        const { data: cat } = await supabase
          .from("news_categories")
          .select("id,key,title")
          .eq("id", data.category_id)
          .maybeSingle();
        setCategory(cat ?? null);
      }
      setLoading(false);
    })();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div dir="rtl" className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary mb-3">المنشور غير متوفر</h1>
        <Button asChild variant="outline">
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      </div>
    );
  }

  const video = post.video_url ? toEmbedUrl(post.video_url) : null;

  return (
    <article dir="rtl" className="bg-muted/20 min-h-[60vh] py-10 md:py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap mb-5">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft size={12} />
          {category && (
            <>
              <Link to={`/news/${category.key}`} className="hover:text-primary">
                {category.title}
              </Link>
              <ChevronLeft size={12} />
            </>
          )}
          <span className="text-foreground line-clamp-1">{post.title}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-primary leading-tight mb-3">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays size={14} />
            <span>{formatDate(post.published_at)}</span>
          </div>
          {post.summary && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
              {post.summary}
            </p>
          )}
        </header>

        {post.cover_image_url && (
          <div className="rounded-lg overflow-hidden border border-border mb-6 bg-card">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {video && (
          <div className="rounded-lg overflow-hidden border border-border mb-6 bg-card aspect-video">
            {video.type === "iframe" ? (
              <iframe
                src={video.src}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={post.title}
              />
            ) : (
              <video src={video.src} controls className="w-full h-full" />
            )}
          </div>
        )}

        {post.content && (
          <div className="bg-card border border-border rounded-lg p-5 md:p-7 mb-6">
            <div className="prose prose-sm md:prose-base max-w-none whitespace-pre-wrap leading-relaxed text-foreground">
              {post.content}
            </div>
          </div>
        )}

        {post.attachment_url && (
          <div className="mb-6">
            {isPdf(post.attachment_url) ? (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary">
                    <FileText size={16} />
                    {post.attachment_name || "ملف PDF"}
                  </div>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a href={post.attachment_url} target="_blank" rel="noreferrer">
                      <Download size={14} /> تحميل
                    </a>
                  </Button>
                </div>
                <iframe
                  src={post.attachment_url}
                  className="w-full h-[600px]"
                  title={post.attachment_name || "PDF"}
                />
              </div>
            ) : isImage(post.attachment_url) ? (
              <div className="rounded-lg overflow-hidden border border-border">
                <img src={post.attachment_url} alt={post.attachment_name || ""} className="w-full" />
              </div>
            ) : (
              <Button asChild variant="outline" className="gap-2">
                <a href={post.attachment_url} target="_blank" rel="noreferrer">
                  <Download size={16} />
                  {post.attachment_name || "تحميل المرفق"}
                </a>
              </Button>
            )}
          </div>
        )}

        {post.external_link && (
          <Button asChild className="gap-2">
            <a href={post.external_link} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              فتح الرابط الخارجي
            </a>
          </Button>
        )}

        <div className="mt-10 pt-6 border-t border-border">
          {category && (
            <Button asChild variant="outline" className="gap-1">
              <Link to={`/news/${category.key}`}>
                <ChevronLeft size={14} />
                كل منشورات: {category.title}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
