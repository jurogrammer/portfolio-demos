export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">서비스 이용약관</h1>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">제1조 (목적)</h2>
          <p>
            이 약관은 ScholarSync KR(이하 &quot;서비스&quot;)이 제공하는 장학금 검색 및 AI 자기소개서 생성
            서비스의 이용 조건과 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제2조 (정의)</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>&quot;서비스&quot;란 ScholarSync KR이 제공하는 장학금 통합 검색, 개인화 매칭, AI 자기소개서 초안 생성 기능을 말합니다.</li>
            <li>&quot;회원&quot;이란 서비스에 가입하여 이용하는 자를 말합니다.</li>
            <li>&quot;AI 생성물&quot;이란 인공지능 기술을 통해 자동으로 생성된 텍스트를 말합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제3조 (서비스 내용)</h2>
          <p>서비스는 다음의 기능을 제공합니다:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>한국장학재단, 사설 재단, 지자체 장학금의 통합 검색</li>
            <li>사용자 프로필 기반 장학금 개인화 매칭</li>
            <li>기관별 자기소개서 항목에 맞춘 AI 초안 생성</li>
            <li>자기소개서 편집, 저장, 다운로드</li>
            <li>장학금 마감일 이메일 알림 (추후 제공)</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제4조 (AI 생성물 관련 면책)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>서비스가 제공하는 자기소개서 초안은 AI가 생성한 참고용 텍스트이며, 최종 제출물이 아닙니다.</li>
            <li>회원은 AI가 생성한 초안을 반드시 본인의 경험과 생각으로 수정한 후 사용해야 합니다.</li>
            <li>
              <strong>AI가 생성한 초안을 그대로 제출하여 발생하는 문제(표절 판정, 불합격 등)에 대해
              서비스는 어떠한 책임도 지지 않습니다.</strong>
            </li>
            <li>AI 생성물에는 사실과 다른 내용이 포함될 수 있으며, 회원은 이를 직접 검증할 책임이 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제5조 (개인정보 보호)</h2>
          <p>
            서비스의 개인정보 수집 및 이용에 관한 사항은 별도의{" "}
            <a href="/privacy" className="text-primary underline">개인정보처리방침</a>에 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제6조 (서비스 변경 및 중단)</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>서비스는 운영상 필요한 경우 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
            <li>서비스 변경 또는 중단 시 사전에 공지하며, 불가피한 경우 사후 공지할 수 있습니다.</li>
            <li>무료로 제공되는 서비스의 변경 또는 중단에 대해 별도의 보상은 하지 않습니다.</li>
          </ol>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t">
          시행일: 2026년 4월 11일
        </p>
      </div>
    </div>
  );
}
