'use client';
import { useState } from 'react';
import { sendContactEmail } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SOCIAL_LINKS } from '@/lib/constants';
import { ExternalLink, CheckCircle2, AlertCircle, Link } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const result = await sendContactEmail(form);
    if (result.success) {
      setStatus('success');
      setForm({ name: '', email: '', company: '', message: '' });
    } else {
      setStatus('error');
      setErrorMsg(result.error || '오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">문의하기</h1>
        <p className="text-muted-foreground">프로젝트 협업이나 기술 상담이 필요하시면 편하게 연락주세요.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="name">이름 *</Label><Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="홍길동" required /></div>
          <div className="space-y-2"><Label htmlFor="email">이메일 *</Label><Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="hong@example.com" required /></div>
          <div className="space-y-2"><Label htmlFor="company">회사 (선택)</Label><Input id="company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="(주)예시회사" /></div>
          <div className="space-y-2"><Label htmlFor="message">메시지 *</Label><Textarea id="message" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="문의사항을 작성해주세요." required /></div>
          {status === 'success' && <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 rounded-lg bg-green-50 dark:bg-green-900/20"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>메시지가 전송되었습니다!</span></div>}
          {status === 'error' && <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 p-3 rounded-lg bg-red-50 dark:bg-red-900/20"><AlertCircle className="h-4 w-4 shrink-0" /><span>{errorMsg}</span></div>}
          <Button type="submit" className="w-full" disabled={status === 'loading'}>{status === 'loading' ? '전송 중...' : '메시지 보내기'}</Button>
        </form>
        <div className="space-y-6">
          <div className="space-y-2"><h2 className="font-semibold">다른 채널로 연락하기</h2><p className="text-sm text-muted-foreground">아래 링크를 통해서도 연락하실 수 있습니다.</p></div>
          <div className="space-y-3">
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"><Link className="h-5 w-5" /><div><p className="text-sm font-medium">GitHub</p><p className="text-xs text-muted-foreground">코드와 사이드 프로젝트</p></div></a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"><Link className="h-5 w-5" /><div><p className="text-sm font-medium">LinkedIn</p><p className="text-xs text-muted-foreground">프로페셔널 프로필</p></div></a>
            <a href={SOCIAL_LINKS.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"><ExternalLink className="h-5 w-5" /><div><p className="text-sm font-medium">기술 블로그</p><p className="text-xs text-muted-foreground">개발 경험과 기술 글</p></div></a>
          </div>
        </div>
      </div>
    </div>
  );
}
