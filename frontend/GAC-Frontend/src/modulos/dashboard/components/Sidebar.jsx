import { FileUser, CalendarDays, ClipboardMinus, UserCog, ShelvingUnit, LayoutDashboard, Users, UserPlus, Shield, PersonStanding, Boxes, BookUser, SquareLibrary, CirclePile, ShieldAlert, Settings, ClipboardList, FileBarChart2, MapPin, Paintbrush, Activity } from "lucide-react";
import { useRef, useState } from "react"
import logoOriginal from '../../../assets/logo.webp'
import { usePersonalizacion } from '../../Personalizacion/publico/usePersonalizacion'
import { ChevronDown } from "lucide-react";
import { ChevronRight, Lock } from "lucide-react";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useAtraparFoco } from "../../../hooks/useAtraparFoco";
import { useCerrarConEscape } from "../../../hooks/useCerrarConEscape";

const Sidebar = ({ onCloseDrawer, isMobile, selectedView, onSelectView }) =>{
    const { tieneModulo } = useAuth();
    const { apariencia } = usePersonalizacion();
    const asideRef = useRef(null);

    // En celular el menú es un cajón sobre el contenido: recibe el foco, Tab cicla dentro,
    // Escape lo cierra y el foco vuelve al botón hamburguesa.
    useAtraparFoco(Boolean(isMobile), asideRef);
    useCerrarConEscape(Boolean(isMobile), onCloseDrawer);

    const [links,setLinks] = useState([

        {name: "Inicio", icon: LayoutDashboard, active:false},
        {name: "Solicitudes", icon: FileUser, active:false, modulo: "solicitudes",
            children: [
                {name: "Bandeja de Solicitudes", icon: BookUser},
                {name: "Gestión de Agrupaciones", icon: PersonStanding},
                {name: "Gestión de Encargados", icon: Users},
            ]
        },
        {name: "Beneficios", icon: ShelvingUnit, active:false, modulo: "beneficios",
            children: [
                {name: "Gestión de Beneficios", icon: SquareLibrary},
                {name: "Asignar Beneficios", icon: CirclePile},
                {name: "Ver Beneficios Asignados", icon: ClipboardList},
                
            ]
        },
        {name: "Calendario", icon: CalendarDays, active:false, modulo: "calendario",
            children: [
                {name: "Gestión del Calendario", icon: CalendarDays},
                {name: "Gestión de Ubicaciones", icon: MapPin},
            ]
        },
        {name: "Conteo", icon: Activity, active:false, modulo: "conteo",
            children: [
                {name: "Panel de Conteo", icon: Activity},
            ]
        },
        {name: "Gestion de Usuarios", icon: UserCog, active:false, modulo: "usuarios",
            children: [
                {name: "Lista de Usuarios", icon: Users},
                {name: "Roles y Permisos", icon: Shield},
            ]
        },
        {name: "Reportes", icon: ClipboardMinus, active:false, modulo: "reportes",
            children: [
                {name: "Reportes de Solicitudes", icon: FileUser},
                {name: "Reportes de Actividades", icon: Boxes},
                {name: "Reportes de Beneficios", icon: FileBarChart2},
                {name: "Reportes de Conteo", icon: Activity, modulo: "conteo"},
            ]
        },
        {name: "Ajustes", icon: Settings, active:false,
            children: [
                {name: "Personalización del Sistema", icon: Paintbrush, modulo: "personalizacion"},
            ]
        },
        
    ]);
    const handleClick = (index) => {
        setLinks(prev =>prev.map((link,i)=>{
            if(i === index){
                if(link.children){
                    return {...link, open: !link.open};
                }
                onSelectView?.(link.name === 'Inicio' ? null : link.name);
                return{ ...link, active: true}
            }
            return link.children ? {...link, active:false} : {...link,active:false};
        }));
    };
    // Un enlace con `modulo` se bloquea si el usuario no tiene ningún permiso en ese módulo.
    const bloqueado = (link) => Boolean(link.modulo) && !tieneModulo(link.modulo);

    const handleChildClick = (childName) => {
        onSelectView?.(childName);
        // Solo cierra en celular/tablet (el Dashboard lo ignora en escritorio).
        onCloseDrawer?.();
    };
    return (
        <aside id="menu-lateral" ref={asideRef} tabIndex={-1} aria-label="Menú lateral" className="print:hidden fixed left-0 top-0 h-screen bg-rail text-white overflow-hidden shadow-xl w-56 z-20 lg:mt-0 mt-14 flex flex-col">
            <div className="h-16 flex items-center px-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                    <img className="h-10 w-10 shrink-0 object-contain" src={apariencia.logo_url || logoOriginal} alt="" width="40" height="40"/>
                        <p className="min-w-0 whitespace-nowrap font-display text-base font-semibold leading-tight tracking-tight text-white">
                        CTP Corralillo
                        </p>
                </div>
            </div>
            {/* Navegacion */}
            <nav aria-label="Menú del panel" className="flex-1 px-3 py-4 overflow-auto">
                <ul className="space-y-1">
                    {links.map((link,index)=> bloqueado(link) ? (
                        <li key={index}>
                            <button type="button" disabled aria-disabled="true" title="No tienes acceso a este módulo"
                                className="w-full flex min-h-10 items-center gap-3 px-3 py-2 rounded-lg text-white/40 cursor-not-allowed">
                                <link.icon className="w-5 h-5 shrink-0" aria-hidden="true"/>
                                <span className="flex-1 text-left text-sm font-medium">{link.name}</span>
                                <Lock className="w-4 h-4" aria-hidden="true"/>
                                <span className="sr-only">(sin acceso)</span>
                            </button>
                        </li>
                    ) : (
                        <li key={index}>
                            <button type="button" onClick={()=> handleClick(index)}
                                aria-expanded={link.children ? Boolean(link.open) : undefined}
                                aria-current={!link.children && link.active ? 'page' : undefined}
                                className={`w-full flex min-h-10 items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 group ${
                                link.active
                                    ? `bg-white/10 text-white shadow-[inset_3px_0_0_0_var(--color-rail-activo)]`
                                    : `text-white/75 hover:bg-white/5 hover:text-white`
                                }`}>
                                <link.icon className={`w-5 h-5 shrink-0 ${link.active ? 'text-rail-activo' : 'text-white/60 group-hover:text-white/90'}`} aria-hidden="true"/>
                                <span className="flex-1 text-left text-sm font-medium">{link.name}</span>
                                {link.badge && (
                                    <span className="bg-primary text-on-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                                        {link.badge}
                                    </span>
                                )}
                                {link.children && (
                                    <span className="text-white/50" aria-hidden="true">
                                        {link.open ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                    </span>
                                )}
                            </button>
                            {link.children && link.open && (
                                <ul className="ml-5 mt-1 mb-2 space-y-0.5 border-l border-white/10 pl-2">
                                    {link.children.map((child,childIndex)=> bloqueado(child) ? (
                                        <li key={childIndex}>
                                            <button type="button" disabled aria-disabled="true" title="No tienes acceso a este módulo"
                                                className="w-full flex min-h-9 items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-white/40 cursor-not-allowed">
                                                <child.icon className="w-4 h-4 shrink-0" aria-hidden="true"/>
                                                <span className="flex-1 text-left">{child.name}</span>
                                                <Lock className="w-3.5 h-3.5" aria-hidden="true"/>
                                                <span className="sr-only">(sin acceso)</span>
                                            </button>
                                        </li>
                                    ) : (
                                        <li key={childIndex}>
                                            <button type="button" onClick={()=> handleChildClick(child.name)}
                                                aria-current={child.name === selectedView ? 'page' : undefined}
                                                className={`w-full flex min-h-9 items-center gap-2.5 px-3 py-1.5 rounded-lg text-left text-sm transition-colors duration-150 ${
                                                child.name === selectedView
                                                    ? 'bg-white/10 font-semibold text-white shadow-[inset_3px_0_0_0_var(--color-rail-activo)]'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}>
                                                <child.icon className={`w-4 h-4 shrink-0 ${child.name === selectedView ? 'text-rail-activo' : 'text-white/55'}`} aria-hidden="true"/>
                                                <span>{child.name}</span>
                                            </button>
                                        </li>
                                    ))}

                                </ul>
                            )}
                        </li>
                    ))}
                </ul>

            </nav>
        </aside>
    )
}
export default Sidebar;