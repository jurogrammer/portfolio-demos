import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PASTOR_PROFILE, STAFF_MEMBERS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "담임목사 소개 | 혜성교회",
  description: "혜성교회 담임목사 소개와 목회 방향을 안내합니다.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f6f4f1]">
        <section className="relative overflow-hidden bg-[#0d0d0d] pt-36 text-white md:pt-44">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-20 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:pb-24">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/58">
                Senior Pastor
              </p>
              <h1 className="mt-4 text-4xl font-bold md:text-5xl">{PASTOR_PROFILE.title}</h1>
              <p className="mt-3 text-sm uppercase tracking-[0.24em] text-white/58">
                {PASTOR_PROFILE.subtitle}
              </p>
              <div className="mt-8 space-y-5 text-sm leading-7 text-white/78 md:text-[15px]">
                {PASTOR_PROFILE.introduction.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <Link
                href={PASTOR_PROFILE.href}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                원본 담임목사 페이지 보기
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative ml-auto w-full max-w-[460px] overflow-hidden rounded-[2rem] border border-white/10">
              <Image
                src={PASTOR_PROFILE.image}
                alt={PASTOR_PROFILE.title}
                width={424}
                height={422}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="mb-10 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                Focus
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                목회 메시지의 중심 문장들
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {PASTOR_PROFILE.focusPoints.map((point) => (
                <Link
                  key={point}
                  href={PASTOR_PROFILE.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.05)] transition hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-lg font-semibold leading-8 text-[#111111]">{point}</p>
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#8c8c84] transition group-hover:text-black" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                Team
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                담임목사와 함께 섬기는 목회팀
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {STAFF_MEMBERS.slice(0, 4).map((member) => (
                <div
                  key={member.name}
                  className="overflow-hidden rounded-[1.6rem] border border-black/6 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative aspect-[1/1] overflow-hidden">
                    <Image src={member.image} alt={member.name} fill className="object-cover" />
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c8c84]">
                      {member.role}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#111111]">{member.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#55554f]">{member.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
