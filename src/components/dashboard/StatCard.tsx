interface StatCardProps {
  label: string;
  value: number;
  detail: string;
  tone: string;
}
export function StatCard({ label, value, detail, tone }: StatCardProps) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        {label}
        <i />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
