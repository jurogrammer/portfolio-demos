{/*
  [S10 Footer 시각 분석]
  - 레이아웃: full-width, 다크 배경 (#333), 왼쪽에 로고 + 주소/연락처
  - 텍스트: 흰색 반투명, 14px
  - 높이: ~145px, 미니멀
*/}
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{
      width: "100%", padding: "30px 40px", background: "#333333",
      display: "flex", alignItems: "center", gap: "40px",
    }}>
      <Image src="/hyesung/logos/milal-logo.png" alt="밀알교회" width={100} height={32}
        style={{ objectFit: "contain", filter: "brightness(10)" }}
 />
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <p style={{ fontSize: "var(--font-size-body)", color: "rgba(255,255,255,0.8)" }}>
          <strong>밀알교회</strong>_ Toronto, ON Canada
        </p>
        <p style={{ fontSize: "var(--font-size-body)", color: "rgba(255,255,255,0.6)" }}>
          Tel : +1-XXX-XXX-XXXX / info@milalchurch.com
        </p>
      </div>
    </footer>
  );
}
