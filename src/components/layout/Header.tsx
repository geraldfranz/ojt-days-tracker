interface HeaderProps {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}
export function Header({ eyebrow, title, action }: HeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {action}
    </header>
  );
}
