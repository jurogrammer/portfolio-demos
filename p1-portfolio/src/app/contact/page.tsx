'use client';
import { useState } from 'react';
import { sendContactEmail } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

export default function ContactPage() {
  const { t } = useLocale();
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
      setErrorMsg(result.error || t.contact.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">{t.contact.title}</h1>
        <p className="text-muted-foreground">{t.contact.description}</p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="space-y-2"><Label htmlFor="name">{t.contact.nameRequired}</Label><Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t.contact.namePlaceholder} required /></div>
        <div className="space-y-2"><Label htmlFor="email">{t.contact.emailRequired}</Label><Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={t.contact.emailPlaceholder} required /></div>
        <div className="space-y-2"><Label htmlFor="company">{t.contact.company}</Label><Input id="company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder={t.contact.companyPlaceholder} /></div>
        <div className="space-y-2"><Label htmlFor="message">{t.contact.messageRequired}</Label><Textarea id="message" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder={t.contact.messagePlaceholder} required /></div>
        {status === 'success' && <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 rounded-lg bg-green-50 dark:bg-green-900/20"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{t.contact.success}</span></div>}
        {status === 'error' && <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 p-3 rounded-lg bg-red-50 dark:bg-red-900/20"><AlertCircle className="h-4 w-4 shrink-0" /><span>{errorMsg}</span></div>}
        <Button type="submit" className="w-full" disabled={status === 'loading'}>{status === 'loading' ? t.contact.submitting : t.contact.submit}</Button>
      </form>
    </div>
  );
}
