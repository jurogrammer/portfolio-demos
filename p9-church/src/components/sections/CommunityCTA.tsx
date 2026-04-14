{/*
  [S09 Anniversary/Community CTA 시각 분석]
  - 레이아웃: full-width, 회색 배경 (#f0f0f0), 중앙 정렬
  - 제목: 50px bold, 검정 텍스트
  - 버튼: 민트(#82BFB8) 배경, 흰 텍스트, border-radius 0px, 넓은 패딩
*/}
export default function CommunityCTA() {
  return (
    <section style={{ width: "100%", padding: "60px 0", background: "var(--color-bg-alt)", textAlign: "center" }}>
      <h2 style={{ fontSize: "var(--font-size-hero)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)", marginBottom: "30px" }}>
        공동체와 함께 신앙생활 하세요
      </h2>
      <a href="#" style={{
        display: "inline-block", padding: "14px 60px", background: "var(--color-accent)",
        color: "var(--color-text-inverse)", fontSize: "var(--font-size-button)",
        fontWeight: "var(--font-weight-regular)", textDecoration: "none", borderRadius: "0px",
      }}>새가족 등록</a>
    </section>
  );
}
