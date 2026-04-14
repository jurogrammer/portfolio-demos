{/*
  [S06 Departments 시각 분석]
  - 레이아웃: contained, 6개 부서 로고 가로 배치 (균등), 아래 3개 부속기관 로고
  - 흰 배경, 부서 로고 이미지 + 이름 텍스트
  - 로고: 직사각형, overflow visible, 이미지 contain
*/}
import Image from "next/image";

const departments = [
  { name: "영아부 (0-4세)", image: "/hyesung/departments/infants.jpg" },
  { name: "유치부 (5-7세)", image: "/hyesung/departments/kindergarten.jpg" },
  { name: "유년부 (1-3학년)", image: "/hyesung/departments/children.jpg" },
  { name: "초등부 (4-6학년)", image: "/hyesung/departments/youth.jpg" },
  { name: "청소년부 (중1-고3)", image: "/hyesung/departments/young-adults.jpg" },
  { name: "청년부", image: "/hyesung/departments/hanarum.jpg" },
];

export default function Departments() {
  return (
    <section style={{ width: "100%", padding: "40px 0", background: "var(--color-bg-main)" }}>
      <div style={{ maxWidth: "var(--spacing-container-max)", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
        {departments.map((dept, i) => (
          <a key={i} href="#" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textDecoration: "none", color: "var(--color-text-heading)", width: "140px" }}>
            <div style={{ position: "relative", width: "120px", height: "80px" }}>
              <Image src={dept.image} alt={dept.name} fill style={{ objectFit: "contain" }}
 />
            </div>
            <p style={{ fontSize: "var(--font-size-body)", textAlign: "center" }}>{dept.name}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
