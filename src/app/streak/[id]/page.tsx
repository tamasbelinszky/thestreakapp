import { EditableStreakCard } from "@/components/EditableStreakCard";
import { getStreakById, getStreaksByUserId } from "@/lib/streak";

export const getData = async (id: string) => {
  const streak = getStreakById(id);
  return streak;
};

export default async function Page({ params }: { params: { id: string } }) {
  const { data: streak } = await getData(params.id);

  if (!streak) {
    return <div>Streak not found</div>;
  }

  return (
    <EditableStreakCard
      name={streak.name}
      description={streak.description}
      startDate={new Date(streak.startDate as number)}
      period={streak.period}
      isCompleted={streak.isCompleted}
      id={streak.id}
      key={streak.id}
    />
  );
}
