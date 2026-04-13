"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile, type ProfileUpdateData } from "@/app/(main)/my/profile/actions";
import { REGIONS, DEGREE_TYPES, INCOME_QUINTILES, UNIVERSITIES, DEPARTMENTS } from "@/lib/constants";
import type { Profile } from "@/types/database";
import AutofillDialog from "./AutofillDialog";
import type { AutofillResult } from "@/app/api/profile/autofill/route";
import { toast } from "sonner";

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

interface Props {
  profile: Profile | null;
}

const GPA_SCALES = [
  { value: "4.5", label: "4.5 만점" },
  { value: "4.3", label: "4.3 만점" },
];

export default function ProfileForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize per-grade GPA from profile
  const initGpaByGrade = (): Record<string, string> => {
    const saved = profile?.gpa_by_grade;
    if (saved && typeof saved === "object") {
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(saved)) {
        result[k] = String(v);
      }
      return result;
    }
    return {};
  };

  const [form, setForm] = useState<ProfileUpdateData>({
    university: profile?.university ?? "",
    department: profile?.department ?? "",
    grade: profile?.grade?.toString() ?? "",
    gpa_by_grade: initGpaByGrade(),
    gpa_scale: profile?.gpa_scale?.toString() ?? "4.5",
    income_quintile: profile?.income_quintile?.toString() ?? "",
    region: profile?.region ?? "",
    degree_type: profile?.degree_type ?? "undergraduate",
    interests: profile?.interests?.join(", ") ?? "",
    bio_keywords: profile?.bio_keywords ?? "",
    experiences: profile?.experiences ?? "",
    awards: profile?.awards ?? "",
    volunteering: profile?.volunteering ?? "",
    work_experience: profile?.work_experience ?? "",
    projects: profile?.projects ?? "",
    leadership: profile?.leadership ?? "",
    motivation: profile?.motivation ?? "",
  });

  const set = (key: keyof ProfileUpdateData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const gpaMax = parseFloat(form.gpa_scale) || 4.5;
  const currentGrade = parseInt(form.grade, 10) || 0;

  // Compute average from per-grade values
  const gpaValues = Object.values(form.gpa_by_grade)
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v) && v >= 0 && v <= gpaMax);
  const averageGpa =
    gpaValues.length > 0
      ? (Math.round((gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length) * 100) / 100).toFixed(2)
      : null;

  const handleAutofill = (data: AutofillResult) => {
    setForm((prev) => ({
      ...prev,
      university: data.university || prev.university,
      department: data.department || prev.department,
      grade: data.grade ? data.grade.toString() : prev.grade,
      degree_type: data.degree_type || prev.degree_type,
      region: data.region || prev.region,
      interests: data.interests || prev.interests,
      bio_keywords: data.bio_keywords || prev.bio_keywords,
      awards: data.awards || prev.awards,
      volunteering: data.volunteering || prev.volunteering,
      work_experience: data.work_experience || prev.work_experience,
      projects: data.projects || prev.projects,
      leadership: data.leadership || prev.leadership,
      motivation: data.motivation || prev.motivation,
      experiences: data.experiences || prev.experiences,
    }));
    toast.success("AI 자동입력 완료! 내용을 확인하고 수정한 뒤 저장해주세요.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfile(form);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI 자동입력 */}
      <AutofillDialog onResult={handleAutofill} />

      {/* 학적 정보 */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <h2 className="text-base font-semibold mb-4">학적 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="대학교" hint="목록에서 선택하거나 직접 입력">
            <input
              type="text"
              list="university-list"
              value={form.university}
              onChange={set("university")}
              placeholder="예: 경희대학교"
              className={inputClass}
            />
            <datalist id="university-list">
              {UNIVERSITIES.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </Field>

          <Field label="학과/전공" hint="목록에서 선택하거나 직접 입력">
            <input
              type="text"
              list="department-list"
              value={form.department}
              onChange={set("department")}
              placeholder="예: 산업경영공학과"
              className={inputClass}
            />
            <datalist id="department-list">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </Field>

          <Field label="학년">
            <select value={form.grade} onChange={set("grade")} className={selectClass}>
              <option value="">선택</option>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  {g}학년
                </option>
              ))}
            </select>
          </Field>

          <Field label="과정">
            <select value={form.degree_type} onChange={set("degree_type")} className={selectClass}>
              {DEGREE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="학점 체계">
            <select value={form.gpa_scale} onChange={set("gpa_scale")} className={selectClass}>
              {GPA_SCALES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          {/* 학년별 학점 입력 */}
          {currentGrade > 0 && (
            <div className="sm:col-span-2 space-y-3">
              <label className="text-sm font-medium">학년별 학점</label>
              <p className="text-xs text-muted-foreground">{gpaMax} 만점 기준, 이수한 학년만 입력하세요</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: currentGrade }, (_, i) => i + 1).map((g) => (
                  <div key={g} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{g}학년</label>
                    <input
                      type="number"
                      min={0}
                      max={gpaMax}
                      step={0.01}
                      value={form.gpa_by_grade[String(g)] ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          gpa_by_grade: { ...prev.gpa_by_grade, [String(g)]: e.target.value },
                        }))
                      }
                      placeholder={`예: 3.75`}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              {averageGpa !== null && (
                <p className="text-sm text-muted-foreground">
                  평균 학점: <span className="font-semibold text-foreground">{averageGpa}</span> / {gpaMax}
                </p>
              )}
            </div>
          )}

          <Field label="거주 지역">
            <select value={form.region} onChange={set("region")} className={selectClass}>
              <option value="">선택</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label="소득분위 (1 ~ 10분위)">
            <select value={form.income_quintile} onChange={set("income_quintile")} className={selectClass}>
              <option value="">선택</option>
              {INCOME_QUINTILES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* 자소서 맞춤 정보 */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <h2 className="text-base font-semibold mb-1">자소서 맞춤 정보</h2>
        <p className="text-xs text-muted-foreground mb-4">
          아래 내용을 자세히 작성할수록 AI가 더 맞춤화된 자소서를 생성합니다.
        </p>
        <div className="space-y-5">
          <Field label="관심 분야" hint="쉼표로 구분 (예: 인공지능, 데이터 분석, 창업)">
            <input
              type="text"
              value={form.interests}
              onChange={set("interests")}
              placeholder="인공지능, 데이터 분석, 창업"
              className={inputClass}
            />
          </Field>

          <Field label="본인 소개 키워드" hint="본인을 나타내는 성격, 강점, 가치관">
            <textarea
              value={form.bio_keywords}
              onChange={set("bio_keywords")}
              placeholder="예: 끈기 있는 성격, 문제 해결을 즐기는 편, 팀 프로젝트에서 조율 역할을 자주 맡음, 사회적 약자에 대한 관심"
              className={textareaClass}
              rows={3}
            />
          </Field>

          <Field label="수상 경력" hint="교내외 수상, 공모전 입상 등을 자유롭게 작성하세요">
            <textarea
              value={form.awards}
              onChange={set("awards")}
              placeholder={"예:\n- 2025 교내 해커톤 대상 (팀장, AI 기반 학습 도우미 개발)\n- 2024 공공데이터 활용 공모전 장려상\n- 2024 학과 성적 우수 장학금 2회 수령"}
              className={textareaClass}
              rows={4}
            />
          </Field>

          <Field label="봉사활동" hint="기간, 기관, 활동 내용 등">
            <textarea
              value={form.volunteering}
              onChange={set("volunteering")}
              placeholder={"예:\n- 지역아동센터 학습 멘토링 (2023.03 ~ 현재, 주 1회)\n- 독거노인 가정 방문 봉사 (2024 여름, 총 80시간)\n- 학교 축제 운영 자원봉사 (2023, 2024)"}
              className={textareaClass}
              rows={4}
            />
          </Field>

          <Field label="인턴/직무 경험" hint="인턴십, 아르바이트, 직무 관련 경험">
            <textarea
              value={form.work_experience}
              onChange={set("work_experience")}
              placeholder={"예:\n- AI 스타트업 백엔드 인턴 (2025.01 ~ 06, 데이터 파이프라인 개발)\n- 교내 도서관 근로장학생 (2024.03 ~ 12)\n- 프리랜서 웹 개발 (2024, 소규모 쇼핑몰 3건 제작)"}
              className={textareaClass}
              rows={4}
            />
          </Field>

          <Field label="프로젝트/연구" hint="학술 연구, 개인/팀 프로젝트, 졸업 논문 등">
            <textarea
              value={form.projects}
              onChange={set("projects")}
              placeholder={"예:\n- 졸업 프로젝트: 딥러닝 기반 한국어 감성 분석 모델 개발\n- 캡스톤 디자인: IoT 스마트 화분 시스템 (팀 4인)\n- 개인 프로젝트: 장학금 추천 웹 서비스 개발"}
              className={textareaClass}
              rows={4}
            />
          </Field>

          <Field label="리더십/동아리" hint="학생회, 동아리, 스터디 그룹 등 리더 경험">
            <textarea
              value={form.leadership}
              onChange={set("leadership")}
              placeholder={"예:\n- 컴퓨터공학과 학생회 부회장 (2024)\n- 코딩 동아리 'DevKor' 회장 (2025)\n- 교내 AI 스터디 그룹 운영 (10명, 주 2회)"}
              className={textareaClass}
              rows={4}
            />
          </Field>

          <Field label="지원 동기 / 미래 계획" hint="장학금을 받으면 어떻게 활용할지, 졸업 후 목표 등">
            <textarea
              value={form.motivation}
              onChange={set("motivation")}
              placeholder={"예:\n- 등록금 부담 없이 학업에 집중하고 싶음\n- 졸업 후 AI 분야 대학원 진학 계획\n- 장기적으로 교육 격차 해소에 기여하는 서비스를 만들고 싶음"}
              className={textareaClass}
              rows={4}
            />
          </Field>

          <Field label="기타 경험/활동" hint="위 항목에 해당하지 않는 특별한 경험이 있다면 자유롭게 작성">
            <textarea
              value={form.experiences}
              onChange={set("experiences")}
              placeholder={"예:\n- 교환학생 (일본 도쿄대, 2024 2학기)\n- TOEIC 950점, JLPT N1\n- 가정형편이 어려운 환경에서 자립한 경험"}
              className={textareaClass}
              rows={4}
            />
          </Field>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/30 rounded-md px-3 py-2">
          프로필이 저장되었습니다.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "저장 중..." : "프로필 저장"}
      </Button>
    </form>
  );
}
