"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-church-border bg-church-accent-light px-8 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-church-primary text-white">
          <Send className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-church-text-heading">
          문의가 접수되었습니다
        </h3>
        <p className="text-sm text-church-text-secondary">
          빠른 시일 내에 답변 드리겠습니다. 감사합니다.
        </p>
        <Button
          variant="outline"
          className="mt-6 border-church-primary text-church-primary hover:bg-church-primary hover:text-white"
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", phone: "", message: "" });
          }}
        >
          다시 문의하기
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-church-text-heading"
        >
          이름 <span className="text-church-accent">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="홍길동"
          className="w-full rounded-lg border border-church-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-primary"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-church-text-heading"
        >
          이메일 <span className="text-church-accent">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="example@email.com"
          className="w-full rounded-lg border border-church-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-primary"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-church-text-heading"
        >
          전화번호
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="010-0000-0000"
          className="w-full rounded-lg border border-church-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-primary"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-church-text-heading"
        >
          문의 내용 <span className="text-church-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="문의 내용을 입력해 주세요."
          className="w-full rounded-lg border border-church-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-primary resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-church-primary text-white hover:bg-church-primary/90 gap-2"
      >
        <Send className="h-4 w-4" />
        보내기
      </Button>
    </form>
  );
}
