import Image from "next/image";
import Link from "next/link";
import { Camera, ExternalLink, MessageCircleMore, Play } from "lucide-react";
import {
  ANNIVERSARY,
  CHURCH_DESCRIPTION,
  CHURCH_NAME,
  CONTACT_INFO,
  NAV_ITEMS,
  SOCIAL_LINKS,
} from "@/lib/constants";

function SocialIcon({ icon }: { icon: (typeof SOCIAL_LINKS)[number]["icon"] }) {
  if (icon === "youtube") {
    return <Play className="h-4 w-4 fill-current" />;
  }

  if (icon === "instagram") {
    return <Camera className="h-4 w-4" />;
  }

  return <MessageCircleMore className="h-4 w-4" />;
}

export function Footer() {
  return (
    <footer className="bg-[#050505] pb-10 pt-14 text-white">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid gap-12 border-b border-white/10 pb-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <Image
              src="/hyesung/logos/hyesung-logo.png"
              alt={CHURCH_NAME}
              width={240}
              height={80}
              className="h-auto w-[128px] brightness-0 invert"
            />
            <p className="mt-5 max-w-md text-sm leading-7 text-white/64">{CHURCH_DESCRIPTION}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/72 transition hover:bg-white hover:text-black"
                  aria-label={link.name}
                >
                  <SocialIcon icon={link.icon} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">
              바로가기
            </p>
            <ul className="mt-5 space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/72 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ANNIVERSARY.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/72 transition hover:text-white"
                >
                  65주년 기념 책 & 화보집
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/45">
              주소와 연락처
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/78">
              <p>{CONTACT_INFO.addressPrimary}</p>
              <p>{CONTACT_INFO.addressSecondary}</p>
              <p>
                Tel : {CONTACT_INFO.phone} / {CONTACT_INFO.phoneAlt}
                <br />
                Fax : {CONTACT_INFO.fax}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 text-xs text-white/35">
          © {new Date().getFullYear()} {CHURCH_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
