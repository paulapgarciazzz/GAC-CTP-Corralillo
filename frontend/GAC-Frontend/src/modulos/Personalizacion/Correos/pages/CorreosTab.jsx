import { Construction } from 'lucide-react';

export default function CorreosTab() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-xl bg-surface text-center">
            <Construction size={28} className="text-foreground-faint" />
            <p className="text-sm font-medium text-foreground">Próximamente</p>
            <p className="text-sm text-foreground-faint max-w-sm">
                Aquí se podrán personalizar asuntos, encabezados y firmas de
                las plantillas de correo existentes, sin afectar la lógica
                de notificaciones ni las credenciales de Resend.
            </p>
        </div>
    );
}
