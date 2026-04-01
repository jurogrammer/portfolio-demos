import Image from "next/image";
import Link from "next/link";
import { ExternalLink, PlayCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ANNIVERSARY,
  CHURCH_DESCRIPTION,
  DEPARTMENTS,
  FEATURED_MEDIA,
  HERO_SECTION,
  MINISTRY_BANNER,
  QUICK_LINKS,
  STAFF_MEMBERS,
  WORSHIP_GUIDE,
} from "@/lib/constants";

function ActionButton({
  href,
  label,
  external,
  tone,
}: {
  href: string;
  label: string;
  external: boolean;
  tone: "muted" | "light";
}) {
  const className =
    tone === "muted"
      ? "bg-black/55 text-white hover:bg-black"
      : "border border-white/18 bg-white/14 text-white hover:bg-white hover:text-black";

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-[0.08em] transition ${className}`}
    >
      {label}
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-[#f6f4f1]">
        <section className="relative min-h-[680px] overflow-hidden bg-black text-white md:min-h-[810px]">
          <Image
            src={HERO_SECTION.backgroundImage}
            alt={CHURCH_DESCRIPTION}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/38" />
          <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1200px] flex-col justify-end px-4 pb-18 pt-36 md:min-h-[810px] md:px-6 md:pb-24 md:pt-44">
            <div className="max-w-[620px] rounded-[2rem] bg-black/28 p-6 backdrop-blur-[2px] md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/72">
                {HERO_SECTION.eyebrow}
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
                <Image
                  src={HERO_SECTION.primaryLogo}
                  alt="혜성교회 로고"
                  width={320}
                  height={110}
                  className="h-auto w-[150px] brightness-0 invert sm:w-[185px]"
                />
                <Image
                  src={HERO_SECTION.secondaryLogo}
                  alt="Underwood Memorial Hall"
                  width={320}
                  height={80}
                  className="h-auto w-[135px] brightness-0 invert sm:mb-[6px] sm:w-[165px]"
                />
              </div>
              <p className="mt-6 max-w-xl text-sm leading-7 text-white/84 md:text-[15px]">
                {HERO_SECTION.summary}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {HERO_SECTION.actions.map((action) => (
                  <ActionButton key={action.label} {...action} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-12 pb-12 md:-mt-16 md:pb-14">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-[1.4rem] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[1.08/1]">
                    <Image src={link.image} alt={link.title} fill className="object-cover" />
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{link.title}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#8c8c84]">
                        {link.subtitle}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#8c8c84] transition group-hover:text-black" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-6">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <Link
              href="https://ch2ch.or.kr/onLine"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2f2f2f]"
            >
              2025 기부금 영수증 발급
            </Link>
          </div>
        </section>

        <section className="bg-[linear-gradient(90deg,#f8ece8_0%,#eef8f6_100%)] py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                  Weekly Media
                </p>
                <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                  예배와 사역 영상
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#4f4f49]">
                원본 사이트의 미디어 그리드 구조를 유지하면서, 각 영상 카드를 반응형으로 다시
                구성했습니다.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {FEATURED_MEDIA.map((media) => (
                <Link
                  key={media.title}
                  href={media.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-[1.5rem] border border-black/5 bg-white/80 shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.1)]"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={media.image}
                      alt={media.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/92 text-[#d8261a] shadow-lg">
                        <PlayCircle className="h-10 w-10 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-lg font-semibold text-[#111111]">{media.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#55554f]">{media.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                Worship Guide
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                예배 안내
              </h2>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-black/6 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.05)]">
              <Image
                src={WORSHIP_GUIDE.image}
                alt="혜성교회 예배 안내판"
                width={980}
                height={234}
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                  Next Generation
                </p>
                <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                  다음 세대와 교육 사역
                </h2>
              </div>
              <Link href="/departments" className="text-sm font-semibold text-[#111111] hover:underline">
                전체 부서 보기
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {DEPARTMENTS.map((department) => (
                <Link
                  key={department.name}
                  href={department.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-[1.5rem] border border-black/6 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[1.75/1]">
                    <Image src={department.image} alt={department.name} fill className="object-cover" />
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c8c84]">
                      {department.age}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#111111]">{department.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#55554f]">{department.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="overflow-hidden rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.05)] md:p-8">
              <Image
                src={MINISTRY_BANNER.image}
                alt={MINISTRY_BANNER.alt}
                width={980}
                height={751}
                className="h-auto w-full rounded-[1.25rem]"
                unoptimized
              />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                Staff
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                섬기는 사람들
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {STAFF_MEMBERS.map((member) => {
                const content = (
                  <>
                    <div className="relative aspect-[1/1] overflow-hidden">
                      <Image src={member.image} alt={member.name} fill className="object-cover" />
                    </div>
                    <div className="px-5 py-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c8c84]">
                        {member.role}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[#111111]">{member.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#55554f]">{member.description}</p>
                      <p className="mt-3 text-xs leading-5 text-[#7a7a73]">{member.detail}</p>
                    </div>
                  </>
                );

                if (member.href) {
                  return (
                    <Link
                      key={member.name}
                      href={member.href}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-[1.6rem] border border-black/6 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div
                    key={member.name}
                    className="overflow-hidden rounded-[1.6rem] border border-black/6 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.05)]"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <Link
              href={ANNIVERSARY.href}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-[2rem] border border-black/6 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
            >
              <Image
                src={ANNIVERSARY.image}
                alt={ANNIVERSARY.title}
                width={1440}
                height={236}
                className="h-auto w-full"
              />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
