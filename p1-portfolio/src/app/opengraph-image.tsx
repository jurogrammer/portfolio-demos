import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Dev. | Fullstack Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Dev
          </div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Dev.
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Fullstack Engineer · Kotlin · Spring Boot · React · Next.js
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
