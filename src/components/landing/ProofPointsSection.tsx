'use client';

const metrics = [
    { value: '40%', label: 'of students regret what/where they study.' },
    { value: '1 in 5', label: 'block themselves by missing prerequisites.' },
    { value: '~50%', label: 'of grads work outside their field.' }
];

export function ProofPointsSection() {
    return (
        <section className="mt-16 rounded-[32px] border border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs uppercase tracking-[0.4em] text-accent">Proof points</p>
                <p>Students and families feel the delta immediately, data shows why.</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="rounded-[24px] border border-border bg-card/70 p-5 text-left text-sm text-muted-foreground shadow-sm"
                    >
                        <p className="text-3xl font-semibold text-foreground">{metric.value}</p>
                        <p className="mt-2 font-medium text-muted-foreground">{metric.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
