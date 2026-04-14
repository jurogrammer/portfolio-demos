{/*
  [S04 Media Grid 시각 분석]
  - 레이아웃: contained (~1200px), 3x3 그리드, gap ~24px
  - 배경: 부드러운 핑크→민트 그라디언트 (전체 섹션)
  - 썸네일: border-radius 0px, box-shadow none, aspect-ratio 16:9
  - 각 썸네일 위에 빨간 YouTube 재생 버튼 (원형, 중앙)
  - 제목: 썸네일 아래 중앙 정렬, 14px regular
*/}
import Image from "next/image";

const videos = [
  { title: "주일예배", thumb: "/hyesung/graphics/sermon.jpg" },
  { title: "말씀묵상", thumb: "/hyesung/graphics/praise-team.jpg" },
  { title: "청년부예배", thumb: "/hyesung/graphics/youth-worship.jpg" },
  { title: "금요찬양예배", thumb: "/hyesung/graphics/friday-praise.jpg" },
  { title: "가스펠프로젝트", thumb: "/hyesung/graphics/gospel-project.jpg" },
  { title: "국내선교", thumb: "/hyesung/graphics/domestic-mission.jpg" },
  { title: "해외선교", thumb: "/hyesung/graphics/overseas-mission.jpg" },
  { title: "양육/훈련", thumb: "/hyesung/graphics/training.jpg" },
  { title: "소그룹", thumb: "/hyesung/graphics/small-group.jpg" },
];

export default function MediaGrid() {
  return (
    <section style={{
      width: "100%", padding: "60px 0",
      background: "linear-gradient(180deg, rgba(255,220,200,0.15) 0%, rgba(200,235,230,0.2) 100%)",
    }}>
      <div style={{ maxWidth: "var(--spacing-container-max)", margin: "0 auto", padding: "0 40px",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px",
      }}>
        {videos.map((v, i) => (
          <a key={i} href="#" style={{ display: "block", textDecoration: "none", color: "var(--color-text-heading)" }}>
            <div style={{
              position: "relative", width: "100%", aspectRatio: "16/9",
              overflow: "hidden", borderRadius: "0px", boxShadow: "none",
              background: "#ccc",
            }}>
              <Image src={v.thumb} alt={v.title} fill style={{ objectFit: "cover" }}
 />
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,0,0,0.85)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "white", fontSize: "18px", marginLeft: "3px" }}>▶</span>
              </div>
            </div>
            <p style={{ marginTop: "10px", fontSize: "var(--font-size-body)", textAlign: "center", letterSpacing: "0.05em" }}>{v.title}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
