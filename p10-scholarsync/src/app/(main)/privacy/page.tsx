export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p>
          ScholarSync KR(이하 &quot;서비스&quot;)은 개인정보보호법에 따라 이용자의 개인정보를 보호하고,
          이와 관련한 고충을 신속하게 처리하기 위해 다음과 같은 개인정보처리방침을 수립·공개합니다.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-foreground">1. 수집하는 개인정보 항목</h2>
          <p><strong>필수 항목:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>이메일 주소 (회원가입 및 로그인)</li>
          </ul>
          <p className="mt-2"><strong>선택 항목 (프로필 입력 시):</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>대학교명, 학과, 학년</li>
            <li>학점 (평균 평점)</li>
            <li>소득분위</li>
            <li>거주 지역</li>
            <li>학위 과정 (학부/석사/박사)</li>
            <li>관심 분야, 자기소개 키워드, 주요 경험</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. 수집 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 관리 및 본인 확인</li>
            <li>프로필 기반 장학금 매칭 서비스 제공</li>
            <li>AI 자기소개서 초안 생성을 위한 맥락 정보 활용</li>
            <li>서비스 개선을 위한 통계 분석 (비식별 처리)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. 보유 및 이용 기간</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 탈퇴 시 즉시 파기합니다.</li>
            <li>단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 법령에 의한 요청이 있는 경우에 한해 제공할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. 개인정보 보호책임자</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>책임자: ScholarSync KR 운영팀</li>
            <li>이메일: support@scholarsync.kr</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. 이용자의 권리와 행사 방법</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
            <li>이용자는 회원 탈퇴를 통해 개인정보의 수집 및 이용에 대한 동의를 철회할 수 있습니다.</li>
            <li>개인정보 관련 문의는 위 개인정보 보호책임자에게 연락하시기 바랍니다.</li>
          </ol>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t">
          시행일: 2026년 4월 11일
        </p>
      </div>
    </div>
  );
}
