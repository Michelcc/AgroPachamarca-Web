export function EmptyTable({
  emoji,
  title,
  message
}: {
  emoji: string;
  title: string;
  message: string;
}) {
  return (
    <div className="empty-table">
      <span className="empty-table-emoji">{emoji}</span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
