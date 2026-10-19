import { useState } from 'react';
import ModalBase from '../../../components/ModalBase';
import Aviso from '../../../components/Aviso';
import { AlertaError, BotonesFormulario, CampoFormulario } from '../../../components/Formulario';
import { BOTON_PRIMARIO_CLASS, INPUT_CLASS } from '../../../utils/formulario';
import CampoPassword from '../../Usuarios/components/CampoPassword';
import { restablecerPassword, solicitarCodigoRecuperacion } from '../../../auth/services/authService';

const SUBTITULOS = {
    correo: 'Ingresa tu correo y te enviaremos un código de verificación.',
    codigo: 'Revisa tu correo e ingresa el código junto con tu nueva contraseña.',
    listo: null,
};

/**
 * Recuperación de contraseña en tres pasos: correo → código + nueva contraseña → listo.
 * Se monta solo mientras está abierto.
 */
export default function ModalRecuperarPassword({ emailInicial = '', onClose }) {
    const [paso, setPaso] = useState('correo');
    const [form, setForm] = useState({ email: emailInicial, codigo: '', password: '', password_confirmation: '' });
    const [enviando, setEnviando] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [mensaje, setMensaje] = useState('');

    const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

    // Ejecuta una petición del flujo y, si sale bien, avanza al paso indicado.
    const ejecutar = async (peticion, siguientePaso) => {
        setEnviando(true);
        setErrores({});
        setErrorGeneral('');
        const resultado = await peticion();
        setEnviando(false);

        if (!resultado.success) {
            setErrores(resultado.errors ?? {});
            if (!Object.keys(resultado.errors ?? {}).length) setErrorGeneral(resultado.error);
            return;
        }
        setMensaje(resultado.data?.message ?? '');
        setPaso(siguientePaso);
    };

    const enviarCodigo = () => ejecutar(() => solicitarCodigoRecuperacion(form.email.trim()), 'codigo');

    const enviar = (e) => {
        e.preventDefault();
        if (paso === 'correo') {
            enviarCodigo();
        } else {
            ejecutar(() => restablecerPassword({ ...form, email: form.email.trim() }), 'listo');
        }
    };

    return (
        <ModalBase titulo="Recuperar contraseña" subtitulo={SUBTITULOS[paso]} alineacion="left" bloqueado={enviando} onClose={onClose}>
            {paso === 'listo' ? (
                <div className="space-y-4">
                    <Aviso tipo="exito" mensaje={mensaje} />
                    <button type="button" onClick={onClose} className={BOTON_PRIMARIO_CLASS}>
                        Volver al inicio de sesión
                    </button>
                </div>
            ) : (
                <form onSubmit={enviar} className="space-y-4" noValidate>
                    {paso === 'correo' ? (
                        <CampoFormulario id="recuperar-email" label="Correo electrónico" error={errores.email?.[0]}>
                            <input id="recuperar-email" type="email" autoComplete="email" required autoFocus
                                value={form.email} onChange={cambiar('email')} className={INPUT_CLASS} />
                        </CampoFormulario>
                    ) : (
                        <>
                            <Aviso tipo="exito" mensaje={mensaje} />
                            <CampoFormulario id="recuperar-codigo" label="Código de verificación" error={errores.codigo?.[0]}>
                                <input id="recuperar-codigo" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus
                                    value={form.codigo} onChange={cambiar('codigo')} className={`${INPUT_CLASS} tracking-[0.5em]`} />
                            </CampoFormulario>
                            <CampoFormulario id="recuperar-password" label="Nueva contraseña" error={errores.password?.[0]}>
                                <CampoPassword id="recuperar-password" autoComplete="new-password" minLength={8} required
                                    value={form.password} onChange={cambiar('password')} aria-describedby="recuperar-password-ayuda" />
                                <p id="recuperar-password-ayuda" className="text-xs text-foreground-faint">Mínimo 8 caracteres.</p>
                            </CampoFormulario>
                            <CampoFormulario id="recuperar-password-confirmacion" label="Confirmar nueva contraseña">
                                <CampoPassword id="recuperar-password-confirmacion" autoComplete="new-password" required
                                    value={form.password_confirmation} onChange={cambiar('password_confirmation')} />
                            </CampoFormulario>
                            <button type="button" onClick={enviarCodigo} disabled={enviando}
                                className="text-xs font-medium text-primary hover:underline disabled:opacity-60 cursor-pointer">
                                ¿No te llegó? Reenviar código
                            </button>
                        </>
                    )}

                    <AlertaError mensaje={errorGeneral} />

                    <BotonesFormulario
                        guardando={enviando}
                        textoEnviar={paso === 'correo' ? 'Enviar código' : 'Cambiar contraseña'}
                        textoGuardando="Enviando..."
                        onCancel={onClose}
                    />
                </form>
            )}
        </ModalBase>
    );
}
