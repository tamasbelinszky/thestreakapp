import { StreakFormEdit } from "@/components/StreakFormEdit";
import { getStreakById } from "@/lib/streak";

export default async function Page({ params }: { params: { id: string } }) {
  const { data: streak } = await getStreakById(params.id);

  if (!streak) {
    return <div>Streak not found</div>;
  }

  return (
    <StreakFormEdit
      name={streak.name}
      description={streak.description}
      startDate={new Date(streak.startDate as number)}
      period={streak.period}
      isCompleted={streak.isCompleted}
      autoComplete={streak.autoComplete}
      id={streak.id}
      key={streak.id}
      streak={streak.streak}
    />
  );
}
