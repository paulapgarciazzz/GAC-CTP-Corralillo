import { Loader2 } from 'lucide-react';

export default function IndicadorCarga() {
    return (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={28} />
        </div>
    );
}
