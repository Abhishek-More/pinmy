export function LegalPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-12 text-[13px] leading-[1.8] text-foreground md:w-1/2">
        {children}
      </div>
    </div>
  );
}

export function LegalH1({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-2 text-xl font-bold">{children}</h1>;
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-2 text-base font-semibold">{children}</h2>;
}

export function LegalDate({ children }: { children: React.ReactNode }) {
  return <p className="mb-8 text-muted-foreground">{children}</p>;
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="pl-6">{children}</ul>;
}
