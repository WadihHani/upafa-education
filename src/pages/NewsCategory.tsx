import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNewsIcon } from "@/lib/news-icons";
import NewsCategoriesSidebar from "@/components/NewsCategoriesSidebar";
import Seo from "@/components/Seo";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Video,
  ExternalLink,
  Inbox,
  ChevronLeft,
} from "lucide-react";

type Category = {
  id: string;
  key: string;
  title: string;
  icon_name: string;
  is_highlighted: boolean;
};

type Post = {
  id: string;
  title: string;
  summary: string;
  cover_image_url: string | null;
  video_url: string | null;
  attachment_url: string | null;
  external_link: string | null;
  published_at: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function NewsCategory() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!categoryKey) return;
    (async () => {
      setLoading(true);
      setNotFound(false);

      const { data: cat } = await supabase
        .from("news_categories")
        .select("id,key,title,icon_name,is_highlighted")
        .eq("key", categoryKey)
        .eq("is_active", true)
        .maybeSingle();

      if (!cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCategory(cat);

      const { data: list } = await supabase
        .from("news_posts")
        .select(
          "id,title,summary,cover_image_url,video_url,attachment_url,external_link,published_at"
        )
        .eq("category_id", cat.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });

      setPosts(list ?? []);
      setLoading(false);
    })();
  }, [categoryKey]);

  if (notFound) {
    return (
      <div dir="rtl" className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary mb-3">القسم غير موجود</h1>
        <Button asChild variant="outline">
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      </div>
    );
  }

  const Icon = getNewsIcon(category?.icon_name);

  return (
    <div dir="rtl">
      {category && (
        <Seo
          title={`${category.title} | UPAFA سوريا`}
          description={`أحدث المنشورات والأخبار ضمن قسم ${category.title} في جامعة UPAFA – فرع سوريا.`}
          path={`/news/${category.key}`}
        />
      )}
      {/* Header */}
      <section
        className={`${
          category?.is_highlighted ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs opacity-80 hover:opacity-100 mb-4"
          >
            <ChevronLeft size={14} /> الرئيسية
          </Link>
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-md flex items-center justify-center ${
                category?.is_highlighted
                  ? "bg-accent-foreground/15"
                  : "bg-primary-foreground/15"
              }`}
            >
              <Icon size={26} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
                {loading ? "..." : category?.title}
              </h1>
              <p className="text-xs md:text-sm opacity-80 mt-1">
                {loading ? "" : `${posts.length} منشور`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="py-10 md:py-16 bg-muted/20 min-h-[40vh]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Inbox className="mx-auto text-muted-foreground/40 mb-3" size={44} />
                    <p className="text-muted-foreground">
                      لا توجد منشورات في هذا القسم بعد.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  {posts.map((p) => (
                    <PostCard key={p.id} post={p} categoryKey={categoryKey!} />
                  ))}
                </div>
              )}
            </div>

            <NewsCategoriesSidebar sticky highlightActive />
          </div>
        </div>
      </section>
    </div>
  );
}

function PostCard({ post, categoryKey }: { post: Post; categoryKey: string }) {
  return (
    <Link
      to={`/news/${categoryKey}/${post.id}`}
      className="group block"
    >
      <Card className="h-full overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
        {post.cover_image_url ? (
          <div className="aspect-[16/9] bg-muted overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <FileText className="text-primary/30" size={48} />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
            <CalendarDays size={12} />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <h3 className="font-bold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          {post.summary && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {post.summary}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {post.video_url && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Video size={10} /> فيديو
              </Badge>
            )}
            {post.attachment_url && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <FileText size={10} /> مرفق
              </Badge>
            )}
            {post.external_link && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <ExternalLink size={10} /> رابط خارجي
              </Badge>
            )}
          </div>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-accent">
            اقرأ المزيد <ArrowLeft size={12} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
