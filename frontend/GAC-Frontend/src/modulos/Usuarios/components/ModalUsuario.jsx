import { useState } from 'react';
import ModalBase from '../../../components/ModalBase';
import { AlertaError, BotonesFormulario, CampoFormulario } from '../../../components/Formulario';
import { INPUT_CLASS } from '../../../utils/formulario';
import CampoPassword from './CampoPassword';
import Switch from '../../../components/Switch';

function FilaSwitch({ titulo, descripcion, checked, onChange, disabled, error }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{titulo}</p>
                <p className="text-xs text-foreground-soft">{descripcion}</p>
                {error && <p className="mt-1 text-xs text-danger">{error}</p>}
            </div>
            <Switch checked={checked} onChange={onChange} label={titulo} disabled={disabled} />
        </div>
    );
}

/**
 * Crear / editar usuario. Se monta solo mientras está abierto, así el estado inicial
 * siempre parte del usuario recibido.
 * `onGuardar(datos)` devuelve `{ success, error, errors }`.
 */
export default function ModalUsuario({ usuario, esUsuarioActual, onClose, onGuardar }) {
    const editando = Boolean(usuario);
    const [form, setForm] = useState({
        name: usuario?.name ?? '',
        email: usuario?.email ?? '',
        password: '',
        activo: usuario?.activo ?? true,
        es_admin: usuario?.es_admin ?? false,
    });
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    const cambiar = (campo) => (valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

    const enviar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrores({});
        setErrorGeneral('');

        const datos = { ...form, name: form.name.trim(), email: form.email.trim() };
        if (editando && !datos.password) delete datos.password;

        const resultado = await onGuardar(datos);
        if (!resultado.success) {
            setGuardando(false);
            setErrores(resultado.errors ?? {});
            if (!Object.keys(resultado.errors ?? {}).length) setErrorGeneral(resultado.error);
        }
    };

    return (
        <ModalBase
            titulo={editando ? 'Editar usuario' : 'Nuevo usuario'}
            subtitulo={editando ? usuario.email : 'Completa los datos para dar acceso al sistema.'}
            alineacion="left"
            bloqueado={guardando}
            onClose={onClose}
        >
            <form onSubmit={enviar} className="space-y-4" noValidate>
                <CampoFormulario id="usuario-nombre" label="Nombre completo" error={errores.name?.[0]}>
                    <input id="usuario-nombre" type="text" autoComplete="name" required value={form.name}
                        onChange={(e) => cambiar('name')(e.target.value)} className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="usuario-email" label="Correo electrónico" error={errores.email?.[0]}>
                    <input id="usuario-email" type="email" autoComplete="email" required value={form.email}
                        onChange={(e) => cambiar('email')(e.target.value)} className={INPUT_CLASS} />
                </CampoFormulario>

                <CampoFormulario id="usuario-password" label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'} error={errores.password?.[0]}>
                    <CampoPassword id="usuario-password" autoComplete="new-password"
                        required={!editando} minLength={8} value={form.password}
                        onChange={(e) => cambiar('password')(e.target.value)}
                        aria-describedby="usuario-password-ayuda" />
                    <p id="usuario-password-ayuda" className="text-xs text-foreground-faint">
                        {editando ? 'Déjala vacía para conservar la actual. ' : ''}Mínimo 8 caracteres.
                    </p>
                </CampoFormulario>

                <div className="divide-y divide-border border-y border-border">
                    <FilaSwitch
                        titulo="Usuario activo"
                        descripcion={esUsuarioActual ? 'No puedes desactivar tu propio usuario.' : 'Los usuarios inactivos no pueden iniciar sesión.'}
                        checked={form.activo}
                        onChange={cambiar('activo')}
                        disabled={esUsuarioActual}
                        error={errores.activo?.[0]}
                    />
                    <FilaSwitch
                        titulo="Administrador"
                        descripcion={esUsuarioActual ? 'No puedes quitarte el rol de administrador.' : 'Acceso total a todos los módulos.'}
                        checked={form.es_admin}
                        onChange={cambiar('es_admin')}
                        disabled={esUsuarioActual}
                        error={errores.es_admin?.[0]}
                    />
                </div>

                <AlertaError mensaje={errorGeneral} />

                <BotonesFormulario guardando={guardando} textoEnviar={editando ? 'Guardar cambios' : 'Crear usuario'} onCancel={onClose} />
            </form>
        </ModalBase>
    );
}
