import Switch from '../../../components/Switch';
import { CampoFormulario } from '../../../components/Formulario';
import { INPUT_CLASS, LABEL_CLASS } from '../../../utils/formulario';

const TIPOS_INPUT = { texto: 'text', email: 'email', url: 'url', tel: 'tel' };

/**
 * Formulario a partir de una lista de campos:
 * { campo, label, tipo: 'texto'|'area'|'email'|'url'|'tel'|'color'|'switch', max, requerido, ayuda, filas, placeholder }.
 * `prefijoError` permite leer errores anidados del backend (p. ej. "aprobada.asunto").
 */
export default function CamposSeccion({ campos, valores, errores = {}, onChange, disabled = false, prefijoError = '', idPrefijo }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {campos.map(({ campo, label, tipo = 'texto', max, requerido = false, ayuda, filas = 3, placeholder, ancho = 'completo' }) => {
                const id = `${idPrefijo}-${campo}`;
                const error = errores[`${prefijoError}${campo}`]?.[0];
                const valor = valores[campo] ?? '';
                const clase = ancho === 'completo' ? 'sm:col-span-2' : '';

                if (tipo === 'switch') {
                    return (
                        <div key={campo} className={`flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3 ${clase}`}>
                            <div>
                                <span className={LABEL_CLASS}>{label}</span>
                                {ayuda && <p className="mt-1 text-xs text-foreground-faint">{ayuda}</p>}
                            </div>
                            <Switch checked={Boolean(valores[campo])} onChange={(v) => onChange(campo, v)} label={label} disabled={disabled} />
                        </div>
                    );
                }

                if (tipo === 'color') {
                    return (
                        <CampoFormulario key={campo} id={id} label={label} error={error} className={clase}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    aria-label={`${label} (selector)`}
                                    value={/^#[0-9a-fA-F]{6}$/.test(valor) ? valor : '#000000'}
                                    onChange={(e) => onChange(campo, e.target.value)}
                                    disabled={disabled}
                                    className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                                <input
                                    id={id}
                                    type="text"
                                    value={valor}
                                    onChange={(e) => onChange(campo, e.target.value)}
                                    required={requerido}
                                    pattern="#[0-9a-fA-F]{6}"
                                    maxLength={7}
                                    disabled={disabled}
                                    className={`${INPUT_CLASS} font-mono uppercase`}
                                />
                            </div>
                            {ayuda && <p className="text-xs text-foreground-faint">{ayuda}</p>}
                        </CampoFormulario>
                    );
                }

                return (
                    <CampoFormulario key={campo} id={id} label={`${label}${requerido ? '' : ' (opcional)'}`} error={error} className={clase}>
                        {tipo === 'area' ? (
                            <textarea
                                id={id}
                                rows={filas}
                                value={valor}
                                onChange={(e) => onChange(campo, e.target.value)}
                                required={requerido}
                                maxLength={max}
                                placeholder={placeholder}
                                disabled={disabled}
                                className={`${INPUT_CLASS} resize-y`}
                            />
                        ) : (
                            <input
                                id={id}
                                type={TIPOS_INPUT[tipo] ?? 'text'}
                                value={valor}
                                onChange={(e) => onChange(campo, e.target.value)}
                                required={requerido}
                                maxLength={max}
                                placeholder={placeholder}
                                disabled={disabled}
                                className={INPUT_CLASS}
                            />
                        )}
                        {ayuda && <p className="text-xs text-foreground-faint">{ayuda}</p>}
                    </CampoFormulario>
                );
            })}
        </div>
    );
}
