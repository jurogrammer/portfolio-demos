{/*
  [S02 Quick Links 시각 분석]
  - 레이아웃: contained (~1100px centered), 4개 독립 카드, 가로 배치, gap ~20px
  - 카드: ~197x193px, border-radius 10px, 배경 이미지(우주/성운 텍스처), NO shadow
  - 색상: 보라/남색(1~2번), 틸/민트(3~4번) 각각 다른 색조 이미지
  - 타이포: 상단 영문 세리프(명조) 소문자 + letter-spacing, 중앙 한글 볼드 대형, 하단 시간 소형
  - 수직 리듬: compact (텍스트 그룹이 응집적)
*/}

const services = [
  {
    labelEn: "SUNDAY SERMON",
    titleKo: "주일 설교",
    time: "주일 오전 8:00 / 9:45 / 11:45",
    bgGradient: "linear-gradient(135deg, #1a1040 0%, #2a3568 40%, #3d4a80 70%, #1a1040 100%)",
    overlayAngle: "135deg",
  },
  {
    labelEn: "ONLINE WORSHIP",
    titleKo: "온라인 예배",
    time: "온라인 동시 진행",
    bgGradient: "linear-gradient(135deg, #2a1850 0%, #3a3070 40%, #4a4580 70%, #2a2060 100%)",
    overlayAngle: "140deg",
  },
  {
    labelEn: "NEW FAMILY",
    titleKo: "새가족 등록",
    time: "온라인 등록",
    bgGradient: "linear-gradient(135deg, #0a4a48 0%, #1a6a60 40%, #2a8070 70%, #0a5a50 100%)",
    overlayAngle: "130deg",
  },
  {
    labelEn: "ONLINE OFFERING",
    titleKo: "온라인 헌금",
    time: "온라인 헌금",
    bgGradient: "linear-gradient(135deg, #1a5a58 0%, #2a7a70 40%, #3a9080 70%, #1a6a60 100%)",
    overlayAngle: "125deg",
  },
];

export default function QuickLinks() {
  return (
    <section style={{ width: "100%", background: "var(--color-bg-main)", padding: "25px 0" }}>
      {/* contained layout - NOT full-bleed */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          padding: "0 40px",
        }}
      >
        {services.map((service, i) => (
          <a
            key={i}
            href="#"
            style={{
              /* Card: 독립 카드 UI, border-radius 10px, overflow hidden */
              position: "relative",
              width: "220px",
              height: "210px",
              borderRadius: "10px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textDecoration: "none",
              boxShadow: "none",
              /* 배경: 리치 그라디언트 (원본은 이미지지만, fallback으로 복잡한 그라디언트 사용) */
              background: service.bgGradient,
            }}
          >
            {/* Diagonal light streak overlay - 원본의 대각선 빛 번짐 재현 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(${service.overlayAngle}, transparent 20%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 60%, transparent 80%)`,
                pointerEvents: "none",
              }}
            />
            {/* Text content - compact vertical rhythm */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                textAlign: "center",
                color: "var(--color-text-inverse)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* English label - serif(명조) font, small caps with spacing */}
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-family-serif)",
                  fontWeight: "var(--font-weight-regular)",
                  opacity: 0.8,
                  marginBottom: "4px",
                }}
              >
                {service.labelEn}
              </p>
              {/* Korean title - bold, large */}
              <h3
                style={{
                  fontSize: "28px",
                  fontWeight: "var(--font-weight-bold)",
                  fontFamily: "var(--font-family-heading)",
                  lineHeight: 1.2,
                  marginBottom: "4px",
                }}
              >
                {service.titleKo}
              </h3>
              {/* Schedule time */}
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "var(--font-weight-regular)",
                  fontFamily: "var(--font-family-body)",
                  opacity: 0.9,
                }}
              >
                {service.time}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
