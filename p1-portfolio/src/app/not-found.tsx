import Link from 'next/link';
import { buttonVariants } from '@/lib/button-variants';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      <p className="text-8xl font-bold text-muted-foreground/20 select-none">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      </div>
      <Link href="/" className={buttonVariants()}>홈으로 돌아가기</Link>
    </div>
  );
}
