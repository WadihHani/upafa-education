import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";

type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url: string | null;
  category: string;
  updated_at?: string;
};

function getImageSrc(member: TeamMember): string | null {
  if (!member.image_url) return null;

  const version = member.updated_at ? new Date(member.updated_at).getTime() : Date.now();
  const separator = member.image_url.includes("?") ? "&" : "?";
  return `${member.image_url}${separator}v=${version}`;
}

// Deterministic palette of accessible colors for letter avatars
const AVATAR_COLORS = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-pink-600",
];

function getInitial(name: string): string {
  // Strip honorifics (د. / أ. / بروفيسور / م.) then take first letter
  const cleaned = name.replace(/^(د\.|أ\.|م\.|بروفيسور)\s*/u, "").trim();
  return cleaned.charAt(0) || name.charAt(0);
}

function getColorFor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function MemberCard({ member }: { member: TeamMember }) {
  const [showZoom, setShowZoom] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const initial = getInitial(member.name);
  const gradient = getColorFor(member.name);
  const imageSrc = imageFailed ? null : getImageSrc(member);

  return (
    <>
      <div className="bg-primary rounded-xl p-8 text-center flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div
          className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mb-5 border-3 border-accent/30 bg-primary-foreground/10 cursor-pointer hover-scale"
          onClick={() => imageSrc && setShowZoom(true)}
        >
          {imageSrc ? (
            <img src={imageSrc} alt={member.name} className="w-full h-full object-cover" loading="lazy" onError={() => setImageFailed(true)} />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-primary-foreground text-4xl font-bold select-none">{initial}</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-primary-foreground mb-2">{member.name}</h3>
        <p className="text-sm font-semibold text-accent mb-3">{member.title}</p>
        <p className="text-sm text-primary-foreground/70 leading-relaxed">{member.bio}</p>
      </div>

      {showZoom && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in cursor-pointer" onClick={() => setShowZoom(false)}>
          <button className="absolute top-4 right-4 text-primary-foreground bg-primary/80 rounded-full p-2 hover:bg-primary transition-colors" onClick={() => setShowZoom(false)}>
            <X size={24} />
          </button>
          <img src={imageSrc} alt={member.name} className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl animate-scale-in object-contain" />
        </div>
      )}
    </>
  );
}

export default function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { get } = useSiteContent();

  useEffect(() => {
    supabase.from("team_members").select("id, name, title, bio, image_url, category, updated_at").order("sort_order").then(({ data }) => {
      if (data) setMembers(data);
    });
  }, []);

  const adminMembers = members.filter((m) => m.category === "admin");
  const academicMembers = members.filter((m) => m.category === "academic");

  const teamIntro = get("team_intro", "");
  const teamCommitment = get("team_commitment", "");

  return (
    <section id="team" className="py-20 bg-[hsl(var(--section-alt))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">فريق الجامعة</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">الهيكل الإداري والأكاديمي</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <p className="text-center text-foreground/70 text-sm leading-[2] max-w-3xl mx-auto mb-14">{teamIntro}</p>

        {adminMembers.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-primary mb-8 text-center">الهيئة الإدارية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {adminMembers.map((member) => <MemberCard key={member.id} member={member} />)}
            </div>
          </div>
        )}

        {academicMembers.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-primary mb-4 text-center">الهيئة التدريسية</h3>
            <p className="text-center text-foreground/60 text-sm leading-[2] max-w-2xl mx-auto mb-8">
              تضم الجامعة مجموعة من الأساتذة والمحاضرين المتخصصين في مختلف المجالات، ممن يمتلكون خبرات أكاديمية وبحثية واسعة، ويساهمون في بناء بيئة تعليمية محفزة على التفكير النقدي والإبداع.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {academicMembers.map((member) => <MemberCard key={member.id} member={member} />)}
            </div>
          </div>
        )}

        <div className="bg-primary rounded-xl p-8 text-center max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-primary-foreground mb-3">التزامنا</h3>
          <p className="text-primary-foreground/80 text-sm leading-[2]">{teamCommitment}</p>
        </div>
      </div>
    </section>
  );
}
