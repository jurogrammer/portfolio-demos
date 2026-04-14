{/*
  [S08 Staff 시각 분석]
  - 레이아웃: contained, "섬기는 사람들" 30px bold 제목 (좌측 정렬)
  - 그리드: 4열, 원형 초상화 (180px diameter), 아래 이름 + 직위
  - 이름: letter-spacing 0.15em (한글 이름 사이 공간감), bold + 직위 regular
  - 역할: muted color, 중앙 정렬
  - 담임목사에만 "자세히 보기" 버튼 (border, border-radius ~20px)
*/}
import Image from "next/image";

const staff = [
  { name: "박형일", title: "목사", role: "담임목사", photo: "/hyesung/staff/pastor-park.jpg", showDetail: true },
  { name: "이기쁨", title: "목사", role: "목사", photo: "/hyesung/staff/pastor-lee.jpg" },
  { name: "김준영", title: "목사", role: "목사", photo: "/hyesung/staff/pastor-kim.jpg" },
  { name: "신효성", title: "목사", role: "목사", photo: "/hyesung/staff/pastor-shin.jpg" },
  { name: "차승현", title: "목사", role: "목사", photo: "/hyesung/staff/pastor-cha.jpg" },
  { name: "이웅", title: "목사", role: "목사", photo: "/hyesung/staff/pastor-lee2.jpg" },
  { name: "오성요", title: "목사", role: "목사", photo: "/hyesung/staff/pastor-park.jpg" },
  { name: "배상진", title: "목사", role: "목사", photo: "/hyesung/staff/pastor-lee.jpg" },
  { name: "최수라", title: "전도사", role: "전도사", photo: "/hyesung/staff/pastor-kim.jpg" },
  { name: "조나단김", title: "전도사", role: "전도사", photo: "/hyesung/staff/pastor-shin.jpg" },
  { name: "최정수", title: "전도사", role: "전도사", photo: "/hyesung/staff/pastor-cha.jpg" },
  { name: "김비치", title: "전도사", role: "전도사", photo: "/hyesung/staff/pastor-lee2.jpg" },
];

export default function Staff() {
  return (
    <section style={{ width: "100%", padding: "80px 0", background: "var(--color-bg-main)" }}>
      <div style={{ maxWidth: "var(--spacing-container-max)", margin: "0 auto", padding: "0 40px" }}>
        <h2 style={{ fontSize: "var(--font-size-h2)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)", marginBottom: "60px" }}>섬기는 사람들</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px 32px" }}>
          {staff.map((person, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative", width: "180px", height: "180px", borderRadius: "50%", overflow: "hidden", background: "#f0f0f0" }}>
                <Image src={person.photo} alt={person.name} fill style={{ objectFit: "cover" }}
 />
              </div>
              <h3 style={{ fontSize: "var(--font-size-body-large)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)", letterSpacing: "0.15em", textAlign: "center" }}>
                {person.name} <span style={{ fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-regular)" }}>{person.title}</span>
              </h3>
              <p style={{ fontSize: "var(--font-size-body)", color: "var(--color-text-muted)", textAlign: "center" }}>{person.role}</p>
              {person.showDetail && (
                <a href="#" style={{
                  marginTop: "4px", padding: "8px 24px", border: "1px solid #ccc",
                  borderRadius: "20px", fontSize: "var(--font-size-small)", color: "var(--color-text-body)",
                  textDecoration: "none", background: "transparent",
                }}>자세히 보기</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
