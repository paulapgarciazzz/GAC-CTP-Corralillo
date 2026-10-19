import { useState } from 'react';
import AparienciaGaleriaTab from '../Apariencia/pages/AparienciaGaleriaTab';
import CorreosTab from '../Correos/pages/CorreosTab';
import InformacionContactoTab from '../InformacionContacto/pages/InformacionContactoTab';
import LandingTab from '../Landing/pages/LandingTab';
import PatrocinadoresTab from '../Patrocinadores/pages/PatrocinadoresTab';

const PESTANAS = [
    { key: 'landing', label: 'Landing page', Componente: LandingTab },
    { key: 'patrocinadores', label: 'Patrocinadores', Componente: PatrocinadoresTab },
    { key: 'correos', label: 'Correos electrónicos', Componente: CorreosTab },
    { key: 'apariencia', label: 'Apariencia y galería', Componente: AparienciaGaleriaTab },
    { key: 'contacto', label: 'Información de contacto', Componente: InformacionContactoTab },
];

export default function PersonalizacionPage() {
    const [pestanaActiva, setPestanaActiva] = useState('patrocinadores');

    const PestanaActual = PESTANAS.find((pestana) => pestana.key === pestanaActiva)?.Componente;

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm text-foreground-faint">Ajustes</p>
                <h1 className="text-2xl font-bold text-primary">Personalización del sistema</h1>
                <p className="mt-1 text-sm text-foreground-soft">
                    Administra el contenido público del sitio sin modificar código.
                </p>
            </div>

            <div className="border-b border-border overflow-x-auto">
                <nav className="flex gap-1 min-w-max">
                    {PESTANAS.map((pestana) => (
                        <button
                            key={pestana.key}
                            type="button"
                            onClick={() => setPestanaActiva(pestana.key)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                                pestana.key === pestanaActiva
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-foreground-soft hover:text-foreground'
                            }`}
                        >
                            {pestana.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {PestanaActual && <PestanaActual />}
            </div>
        </div>
    );
}
