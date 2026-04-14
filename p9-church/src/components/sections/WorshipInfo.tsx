{/*
  [S05 Worship Info 시각 분석]
  - 레이아웃: contained, 2-column (좌: 스케줄 테이블, 우: 교회 건물 사진 + 지도)
  - 흰 배경, "예배 안내" 30px bold 제목
  - 테이블: pipe(|) 구분선, 서비스명 | 시간 형식
  - 우측: 교회 건물 이미지 + 간단한 안내문
*/}
import Image from "next/image";

const mainSchedule = [
  { service: "1부", time: "오전 08:00" },
  { service: "2부", time: "오전 09:45" },
  { service: "3부", time: "오전 11:45" },
  { service: "4부 (청년)", time: "오후 02:00" },
];

const deptSchedule = [
  { dept: "영유아부", time: "주일 9:45 / 11:45" },
  { dept: "유치부", time: "주일 9:45 / 11:45" },
  { dept: "아동부", time: "주일 9:45 / 11:45" },
  { dept: "청소년부 (KM)", time: "주일 9:45 / 11:45" },
  { dept: "청소년부 (EM)", time: "주일 11:45 / 공부 12:45pm" },
];

export default function WorshipInfo() {
  return (
    <section style={{ width: "100%", padding: "60px 0", background: "var(--color-bg-main)" }}>
      <div style={{ maxWidth: "var(--spacing-container-max)", margin: "0 auto", padding: "0 40px", display: "flex", gap: "60px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "var(--font-size-h2)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-heading)", marginBottom: "30px" }}>예배 안내</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <tbody>
              {mainSchedule.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px 0", fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-heading)", width: "120px" }}>{item.service}</td>
                  <td style={{ padding: "8px 16px", fontSize: "var(--font-size-body)", color: "var(--color-text-body)", borderLeft: "1px solid #ddd" }}>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {deptSchedule.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px 0", fontSize: "var(--font-size-body)", color: "var(--color-text-heading)", width: "140px" }}>{item.dept}</td>
                  <td style={{ padding: "6px 16px", fontSize: "var(--font-size-body)", color: "var(--color-text-body)", borderLeft: "1px solid #ddd" }}>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-end" }}>
          <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "0px", overflow: "hidden", background: "#e5e5e5" }}>
            <Image src="/hyesung/graphics/church-building.jpg" alt="교회 건물" fill style={{ objectFit: "cover" }}
 />
          </div>
          <p style={{ fontSize: "var(--font-size-body)", color: "var(--color-text-body)", textAlign: "right" }}>Toronto, ON Canada</p>
        </div>
      </div>
    </section>
  );
}
