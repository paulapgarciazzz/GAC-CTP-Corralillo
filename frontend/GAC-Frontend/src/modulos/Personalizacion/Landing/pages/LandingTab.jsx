import { Construction } from 'lucide-react';

export default function LandingTab() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-xl bg-surface text-center">
            <Construction size={28} className="text-foreground-faint" />
            <p className="text-sm font-medium text-foreground">Próximamente</p>
            <p className="text-sm text-foreground-faint max-w-sm">
                Aquí se podrán personalizar los títulos, textos, imágenes y
                botones de la landing page.
            </p>
        </div>
    );
}
