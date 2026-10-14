import { useState } from 'react';
import ModalSolicitud from '../../SolicitudesAgrupaciones/components/ModalSolicitud';
import ModalSolicitudExistente from '../../SolicitudesAgrupaciones/components/ModalSolicitudExistente';
import ModalPreguntaParticipacion from '../../SolicitudesAgrupaciones/components/ModalPreguntaParticipacion';
import festivalTortilla from '../../../assets/WhatsApp-Image-2026-07-24-at-2.41.37-PM-1-800x533.jpeg';

const EVENTO = {
    nombre: 'Festival de la Tortilla 2026',
    descripcion: 'Una celebración cultural del CTP de Corralillo con actividades, gastronomía y tradición guanacasteca.',
};

export default function EventoDestacado() {
    const [pasoModal, setPasoModal] = useState(null);

    return (
        <section id="evento" className="scroll-mt-24 bg-surface py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-md md:grid md:grid-cols-2">
                    <div className="h-64 md:h-full">
                        <img
                            src={festivalTortilla}
                            alt={EVENTO.nombre}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center p-8 text-center sm:p-10 md:text-left">
                        <h2 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">{EVENTO.nombre}</h2>
                        <p className="mb-6 text-foreground-soft">{EVENTO.descripcion}</p>
                        <button
                            type="button"
                            onClick={() => setPasoModal('pregunta')}
                            className="mx-auto w-fit rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-primary-hover hover:shadow-lg md:mx-0"
                        >
                            Inscríbete
                        </button>
                    </div>
                </div>
            </div>

            <ModalPreguntaParticipacion
                open={pasoModal === 'pregunta'}
                onClose={() => setPasoModal(null)}
                onRespuesta={(yaParticipo) => setPasoModal(yaParticipo ? 'existente' : 'nuevo')}
            />
            <ModalSolicitud open={pasoModal === 'nuevo'} onClose={() => setPasoModal(null)} />
            <ModalSolicitudExistente open={pasoModal === 'existente'} onClose={() => setPasoModal(null)} />
        </section>
    );
}
