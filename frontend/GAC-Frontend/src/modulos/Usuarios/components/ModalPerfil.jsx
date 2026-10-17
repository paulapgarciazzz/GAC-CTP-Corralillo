import { useState } from 'react';
import { ChevronDown, ImagePlus, Trash2 } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import { redimensionarImagen } from '../../../utils/imagen';
import ModalBase from '../../Calendario/components/ModalBase';
import { AlertaError, BotonesFormulario, CampoFormulario } from '../../Calendario/components/Formulario';
import { INPUT_CLASS } from '../../Calendario/lib/formulario';
import { actualizarPerfil } from '../services/usuarioService';
import CampoPassword from './CampoPassword';
import { InsigniaRol } from './Insignias';

const PASSWORD_VACIA = { password_actual: '', password: '', password_confirmation: '' };

/**
 * Perfil del usuario autenticado: nombre, correo, foto y contraseña.
 * Disponible para cualquier rol. Se monta solo mientras está abierto.
 * Solo envía los campos que cambiaron; `onGuardado(usuario)` recibe el usuario actualizado.
 */
export default function ModalPerfil({ usuario, onClose, onGuardado }) {
    const [form, setForm] = useState({ name: usuario.name ?? '', email: usuario.email ?? '', foto: usuario.foto ?? null });
    const [passwords, setPasswords] = useState(PASSWORD_VACIA);
    const [cambiarPassword, setCambiarPassword] = useState(false);
    const [procesandoFoto, setProcesandoFoto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    const cambiarPass = (campo) => (e) => setPasswords((prev) => ({ ...prev, [campo]: e.target.value }));

    const elegirFoto = async (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;

        setProcesandoFoto(true);
        setErrores((prev) => ({ ...prev, foto: undefined }));
        try {
            const foto = await redimensionarImagen(archivo);
            setForm((prev) => ({ ...prev, foto }));
        } catch (error) {
            setErrores((prev) => ({ ...prev, foto: [error.message] }));
        } finally {
            setProcesandoFoto(false);
        }
    };

    const alternarPassword = () => {
        setCambiarPassword((abierto) => !abierto);
        setPasswords(PASSWORD_VACIA);
    };

    const enviar = async (e) => {
        e.preventDefault();

        const datos = {};
        if (form.name.trim() !== usuario.name) datos.name = form.name.trim();
        if (form.email.trim() !== usuario.email) datos.email = form.email.trim();
        if (form.foto !== (usuario.foto ?? null)) datos.foto = form.foto;
        if (cambiarPassword && passwords.password) Object.assign(datos, passwords);

        if (!Object.keys(datos).length) {
            onClose();
            return;
        }

        setGuardando(true);
        setErrores({});
        setErrorGeneral('');
        const resultado = await actualizarPerfil(datos);

        if (!resultado.success) {
            setGuardando(false);
            setErrores(resultado.errors ?? {});
            if (!Object.keys(resultado.errors ?? {}).length) setErrorGeneral(resultado.error);
            return;
        }
        onGuardado(resultado.data);
    };

    return (
        <ModalBase titulo="Mi perfil" subtitulo="Actualiza tus datos y tu foto." alineacion="left" bloqueado={guardando} onClose={onClose}>
            <form onSubmit={enviar} className="space-y-4" noValidate>
                <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-border">
                    <Avatar nombre={form.name || usuario.name} foto={form.foto} tamano="xl" className="border-2 border-border" />
                    <div className="flex flex-col items-center sm:items-start gap-2 min-w-0">
                        <InsigniaRol esAdmin={usuario.es_admin} />
                        <div className="flex flex-wrap justify-center gap-2">
                            <label htmlFor="perfil-foto" aria-disabled={procesandoFoto}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                                <ImagePlus size={14} />
                                {procesandoFoto ? 'Procesando...' : form.foto ? 'Cambiar foto' : 'Subir foto'}
                            </label>
                            {form.foto && (
                                <button type="button" onClick={() => setForm((prev) => ({ ...prev, foto: null }))}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-danger/40 text-danger hover:bg-danger-soft transition-colors cursor-pointer">
                                    <Trash2 size={14} />Quitar foto
                                </button>
                            )}
                        </div>
                        <input id="perfil-foto" type="file" accept="image/*" onChange={elegirFoto} disabled={procesandoFoto} className="sr-only" />
                        <p className="text-xs text-foreground-faint">Se recorta en cuadrado automáticamente.</p>
                        {errores.foto && <p className="text-xs text-danger">{errores.foto[0]}</p>}
                    </div>
                </div>

                <CampoFormulario id="perfil-nombre" label="Nombre completo" error={errores.name?.[0]}>
                    <input id="perfil-nombre" type="text" autoComplete="name" required value={form.name} onChange={cambiar('name')} className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="perfil-email" label="Correo electrónico" error={errores.email?.[0]}>
                    <input id="perfil-email" type="email" autoComplete="email" required value={form.email} onChange={cambiar('email')} className={INPUT_CLASS} />
                </CampoFormulario>

                <div className="border border-border rounded-lg">
                    <button type="button" onClick={alternarPassword} aria-expanded={cambiarPassword} aria-controls="perfil-seccion-password"
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-background rounded-lg transition-colors cursor-pointer">
                        Cambiar contraseña
                        <ChevronDown size={18} className={`text-foreground-faint transition-transform duration-200 ${cambiarPassword ? 'rotate-180' : ''}`} />
                    </button>
                    {cambiarPassword && (
                        <div id="perfil-seccion-password" className="px-4 pb-4 space-y-4">
                            <CampoFormulario id="perfil-password-actual" label="Contraseña actual" error={errores.password_actual?.[0]}>
                                <CampoPassword id="perfil-password-actual" autoComplete="current-password" value={passwords.password_actual} onChange={cambiarPass('password_actual')} />
                            </CampoFormulario>
                            <CampoFormulario id="perfil-password" label="Nueva contraseña" error={errores.password?.[0]}>
                                <CampoPassword id="perfil-password" autoComplete="new-password" minLength={8} value={passwords.password} onChange={cambiarPass('password')} aria-describedby="perfil-password-ayuda" />
                                <p id="perfil-password-ayuda" className="text-xs text-foreground-faint">Mínimo 8 caracteres.</p>
                            </CampoFormulario>
                            <CampoFormulario id="perfil-password-confirmacion" label="Confirmar nueva contraseña">
                                <CampoPassword id="perfil-password-confirmacion" autoComplete="new-password" value={passwords.password_confirmation} onChange={cambiarPass('password_confirmation')} />
                            </CampoFormulario>
                        </div>
                    )}
                </div>

                <AlertaError mensaje={errorGeneral} />

                <BotonesFormulario guardando={guardando} deshabilitarEnviar={procesandoFoto} textoEnviar="Guardar cambios" onCancel={onClose} />
            </form>
        </ModalBase>
    );
}
