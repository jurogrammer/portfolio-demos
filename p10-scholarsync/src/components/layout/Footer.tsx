import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-2">
              <GraduationCap className="h-5 w-5" />
              ScholarSync KR
            </div>
            <p className="text-sm text-muted-foreground">
              장학금 탐색과 지원을 10분 안에 끝내세요.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">서비스</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link href="/scholarships" className="hover:text-foreground">장학금 검색</Link></li>
              <li><Link href="/auth/signup" className="hover:text-foreground">회원가입</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm">법적 고지</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-6 pt-4 text-center text-xs text-muted-foreground">
          © 2026 ScholarSync KR. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
