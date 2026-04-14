{/*
  [S03 Banner 시각 분석]
  - 레이아웃: full-width, 중앙 정렬, 흰 배경 위 민트 반투명 버튼
  - 버튼: rgba(130,191,184,0.64) 배경, 흰 텍스트, border-radius 0, 넓은 패딩
  - 수직 여백: 위아래 40~50px
*/}
export default function Banner() {
  return (
    <section style={{ width: "100%", padding: "50px 0", display: "flex", justifyContent: "center", background: "var(--color-bg-main)" }}>
      <a href="#" style={{
        display: "inline-block", padding: "16px 100px",
        background: "rgba(130, 191, 184, 0.64)", color: "var(--color-text-inverse)",
        fontSize: "var(--font-size-button)", fontFamily: "var(--font-family-body)",
        fontWeight: "var(--font-weight-regular)", textDecoration: "none",
        border: "none", borderRadius: "0px",
      }}>밀알 MBA 수강신청</a>
    </section>
  );
}
