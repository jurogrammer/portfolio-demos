import { getQuestions } from "./actions";
import { getCohorts } from "../cohorts/actions";
import { QuestionsPageClient } from "./QuestionsPageClient";

export default async function QuestionsPage() {
  const [questions, cohorts] = await Promise.all([
    getQuestions(),
    getCohorts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">질문 관리</h1>
        <p className="text-sm text-muted-foreground">질문을 생성·수정·삭제하고 즉시 발송할 수 있습니다.</p>
      </div>
      <QuestionsPageClient initialQuestions={questions} cohorts={cohorts} />
    </div>
  );
}
