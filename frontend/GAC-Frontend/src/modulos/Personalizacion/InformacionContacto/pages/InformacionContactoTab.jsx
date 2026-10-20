import { Construction } from 'lucide-react';

export default function InformacionContactoTab() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-xl bg-surface text-center">
            <Construction size={28} className="text-foreground-faint" />
            <p className="text-sm font-medium text-foreground">Próximamente</p>
            <p className="text-sm text-foreground-faint max-w-sm">
                Aquí se podrán personalizar teléfonos, dirección y redes
                sociales que se muestran en el pie de página.
            </p>
        </div>
    );
}
