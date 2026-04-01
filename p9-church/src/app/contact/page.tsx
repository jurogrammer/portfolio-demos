import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  CONTACT_INFO,
  CONTACT_LINKS,
  OFFERING_GUIDE,
  SOCIAL_LINKS,
  WORSHIP_GUIDE,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "예배 안내 | 혜성교회",
  description: "혜성교회 예배 장소, 연락처, 온라인 안내 링크를 확인하세요.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f6f4f1]">
        <section className="bg-[#0d0d0d] pt-36 text-white md:pt-44">
          <div className="mx-auto max-w-[1200px] px-4 pb-20 md:px-6 md:pb-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/58">
              Worship & Contact
            </p>
            <h1 className="mt-4 text-4xl font-bold md:text-5xl">예배 안내와 오시는 길</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/76 md:text-[15px]">
              원본 사이트의 연락처와 예배 장소 안내 구조를 기준으로, 실제 주소와 외부 링크
              중심의 안내 페이지로 재구성했습니다.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto grid max-w-[1200px] gap-6 px-4 md:grid-cols-[1.1fr_0.9fr] md:px-6">
            <div className="rounded-[1.8rem] border border-black/6 bg-white p-7 shadow-[0_14px_30px_rgba(0,0,0,0.05)] md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1efea]">
                  <MapPin className="h-6 w-6 text-[#111111]" />
                </div>
                <div className="space-y-4 text-sm leading-7 text-[#4f4f49]">
                  <p className="text-base font-semibold text-[#111111]">예배 장소</p>
                  <p>{CONTACT_INFO.addressSecondary}</p>
                  <p>{CONTACT_INFO.addressPrimary}</p>
                </div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {CONTACT_INFO.mapLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/8 px-4 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white"
                  >
                    {item.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-black/6 bg-white p-7 shadow-[0_14px_30px_rgba(0,0,0,0.05)] md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1efea]">
                  <Phone className="h-6 w-6 text-[#111111]" />
                </div>
                <div className="space-y-4 text-sm leading-7 text-[#4f4f49]">
                  <p className="text-base font-semibold text-[#111111]">연락처</p>
                  <p>
                    Tel : {CONTACT_INFO.phone}
                    <br />
                    Tel : {CONTACT_INFO.phoneAlt}
                    <br />
                    Fax : {CONTACT_INFO.fax}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/8 px-4 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white"
                  >
                    {link.name}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
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
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                Helpful Links
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111] md:text-4xl">
                자주 찾는 온라인 안내
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {CONTACT_LINKS.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[1.6rem] border border-black/6 bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#111111]">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#55554f]">{item.description}</p>
                    </div>
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#8c8c84] transition group-hover:text-black" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="offering-guide" className="pb-20">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="rounded-[2rem] border border-black/6 bg-white p-7 shadow-[0_16px_40px_rgba(0,0,0,0.05)] md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c8c84]">
                Offering Guide
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#111111]">{OFFERING_GUIDE.title}</h2>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[#55554f]">
                {OFFERING_GUIDE.description}
              </p>
              <ul className="mt-6 grid gap-4 md:grid-cols-3">
                {OFFERING_GUIDE.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="rounded-[1.3rem] bg-[#f4f1ec] px-5 py-5 text-sm leading-6 text-[#3d3d38]"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
