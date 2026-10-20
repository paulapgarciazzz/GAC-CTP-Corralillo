import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Aviso from '../../../../components/Aviso';
import { CampoFormulario } from '../../../../components/Formulario';
import { EstadoCargando } from '../../../../components/EstadoLista';
import { BOTON_PRIMARIO_CLASS, INPUT_CLASS } from '../../../../utils/formulario';
import {
    actualizarConfiguracionPatrocinadores,
    obtenerConfiguracionPatrocinadores,
} from '../services/patrocinadorService';

/** Título y descripción de la sección de patrocinadores. Sin `puedeEditar` queda en solo lectura. */
export default function ConfiguracionSeccion({ puedeEditar = false }) {
    const [valores, setValores] = useState({ titulo: '', descripcion: '' });
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        let activo = true;

        obtenerConfiguracionPatrocinadores().then((resultado) => {
            if (!activo) return;
            if (resultado.success) setValores(resultado.data);
            else setError(resultado.error);
            setCargando(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValores((prev) => ({ ...prev, [name]: value }));
    };

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError('');
        setErrores({});
        setMensajeExito('');

        const resultado = await actualizarConfiguracionPatrocinadores(valores);
        setGuardando(false);

        if (resultado.success) {
            setValores(resultado.data);
            setMensajeExito('Configuración actualizada correctamente.');
            window.setTimeout(() => setMensajeExito(''), 3500);
        } else {
            setError(resultado.error);
            setErrores(resultado.errors ?? {});
        }
    };

    if (cargando) return <EstadoCargando texto="Cargando configuración..." />;

    return (
        <form onSubmit={guardar} className="space-y-4 max-w-xl">
            <CampoFormulario id="config-patrocinadores-titulo" label="Título de la sección" error={errores.titulo?.[0]}>
                <input id="config-patrocinadores-titulo" name="titulo" type="text" value={valores.titulo} onChange={handleChange} required maxLength={255} disabled={!puedeEditar} className={INPUT_CLASS} />
            </CampoFormulario>

            <CampoFormulario id="config-patrocinadores-descripcion" label="Descripción (opcional)" error={errores.descripcion?.[0]}>
                <textarea id="config-patrocinadores-descripcion" name="descripcion" rows={3} value={valores.descripcion ?? ''} onChange={handleChange} maxLength={1000} disabled={!puedeEditar} className={`${INPUT_CLASS} resize-y`} />
            </CampoFormulario>

            <Aviso tipo="exito" mensaje={mensajeExito} />
            <Aviso mensaje={error} />

            {puedeEditar && (
                <button type="submit" disabled={guardando} className={`${BOTON_PRIMARIO_CLASS} sm:w-auto sm:px-4`}>
                    {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
            )}
        </form>
    );
}
