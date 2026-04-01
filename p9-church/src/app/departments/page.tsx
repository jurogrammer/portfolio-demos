import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AFFILIATES, DEPARTMENTS, MINISTRY_BANNER, STAFF_MEMBERS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "다음세대와 사역 | 혜성교회",
  description: "혜성교회 다음 세대 부서와 교육·사역 링크를 안내합니다.",
};

export default function DepartmentsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f6f4f1]">
        <section className="bg-[#0d0d0d] pt-36 text-white md:pt-44">
          <div className="mx-auto max-w-[1200px] px-4 pb-20 md:px-6 md:pb-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/58">
              Next Generation & Ministry
            </p>
            <h1 className="mt-4 text-4xl font-bold md:text-5xl">다음 세대와 교육 사역</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/76 md:text-[15px]">
              혜성교회는 영아부부터 청년교구까지, 각 세대가 자기 언어로 복음을 배우고
              예배하도록 돕는 부서 체계를 운영합니다. 원본 사이트의 이미지형 부서 소개를
              기준으로 페이지를 재구성했습니다.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {DEPARTMENTS.map((department) => (
                <Link
                  key={department.name}
                  href={department.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-[1.6rem] border border-black/6 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[1.75/1] overflow-hidden">
                    <Image src={department.image} alt={department.name} fill className="object-cover" />
                  </div>
                  <div className="px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c8c84]">
                          {department.age}
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-[#111111]">
                          {department.name}
                        </h2>
                      </div>
                      <ArrowUpRight className="mt-1 h-5 w-5 text-[#8c8c84] transition group-hover:text-black" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#55554f]">{department.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="affiliates" className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                Affiliates
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                함께 운영하는 교육 기관
              </h2>
            </div>
            <div className="grid gap-5 rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] md:grid-cols-3 md:p-8">
              {AFFILIATES.map((affiliate) => (
                <Link
                  key={affiliate.name}
                  href={affiliate.href}
                  target={affiliate.href.startsWith("/") ? undefined : "_blank"}
                  rel={affiliate.href.startsWith("/") ? undefined : "noreferrer"}
                  className="flex min-h-28 items-center justify-center rounded-[1.2rem] border border-black/5 bg-[#f7f5f2] px-4 py-6 transition hover:bg-[#efede8]"
                >
                  <Image
                    src={affiliate.image}
                    alt={affiliate.name}
                    width={240}
                    height={60}
                    className="h-auto max-h-12 w-auto"
                  />
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
                Ministry Team
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                다음 세대를 세우는 사역팀
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {STAFF_MEMBERS.slice(2).map((member) => (
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
