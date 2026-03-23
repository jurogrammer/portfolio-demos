import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ProjectOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ');
  return new ImageResponse(
    <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '60px' }}>
      <div style={{ color: '#a78bfa', fontSize: 20, marginBottom: 16, fontWeight: 600 }}>주인재 | 포트폴리오</div>
      <div style={{ color: '#f8fafc', fontSize: 52, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>{title}</div>
    </div>,
    { ...size }
  );
}
