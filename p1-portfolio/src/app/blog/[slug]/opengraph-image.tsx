import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function BlogOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ');
  return new ImageResponse(
    <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '60px' }}>
      <div style={{ color: '#34d399', fontSize: 20, marginBottom: 16, fontWeight: 600 }}>주인재 | 블로그</div>
      <div style={{ color: '#f8fafc', fontSize: 52, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>{title}</div>
    </div>,
    { ...size }
  );
}
