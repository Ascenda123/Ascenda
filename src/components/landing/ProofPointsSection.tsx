'use client';

const metrics = [
    { value: '40%', label: 'of students regret what/where they study.' },
    { value: '1 in 5', label: 'block themselves by missing prerequisites.' },
    { value: '~50%', label: 'of grads work outside their field.' }
];

export function ProofPointsSection() {
    return (
        <section className="w-full py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-border/40 pb-8">
                    <div className="max-w-xl">
                        <p className="text-sm font-medium uppercase tracking-widest text-primary/80 mb-3">The Reality</p>
                        <h2 className="text-3xl font-heading font-bold text-foreground">Why the old way isn&#39;t working</h2>
                    </div>
                    <p className="text-muted-foreground max-w-md text-lg">Students and families feel the delta immediately, and the data backs it up.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="group relative flex flex-col justify-between p-8 rounded-3xl bg-secondary/10 hover:bg-secondary/20 transition-colors duration-300"
                        >
                            <div className="space-y-4">
                                <p className="text-5xl md:text-6xl font-bold tracking-tight text-primary">{metric.value}</p>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed">{metric.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
