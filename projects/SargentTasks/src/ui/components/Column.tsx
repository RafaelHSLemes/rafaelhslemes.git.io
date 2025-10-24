export function Column({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="col card">
      <div className="col-header">
        <h3>{title}</h3>
      </div>
      <div className="col-body">
        {children}
      </div>
    </div>
  )
}

