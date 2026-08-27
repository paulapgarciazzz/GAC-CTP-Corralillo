import { FileUser, CalendarDays, ClipboardMinus, UserCog, ShelvingUnit, LayoutDashboard, Users, UserPlus, Shield, PersonStanding, UsersRound, Boxes, UserRoundArrowLeft, BookUser, SquareLibrary, CirclePile } from "lucide-react";
import { useState } from "react"
import logo from '../../../assets/logo.png'
import { ChevronDown } from "lucide-react";
import { ChevronRight } from "lucide-react";

const Sidebar = ({ onCloseDrawer, selectedView, onSelectView }) =>{

    const [links,setLinks] = useState([

        {name: "Inicio", icon: LayoutDashboard, active:false},
        {name: "Solicitudes", icon: FileUser, active:false,
            children: [
                {name: "Gestion de Solicitudes", icon: BookUser},
                {name: "Gestion de Agrupaciones", icon: PersonStanding},
            ]
        },
        {name: "Inventario", icon: ShelvingUnit, active:false,
            children: [
                {name: "Gestion de Inventario", icon: SquareLibrary},
                {name: "Agregar a inventario", icon: CirclePile},
            ]
        },
        {name: "Calendario", icon: CalendarDays, active:false},
        {name: "Gestion de Usuarios", icon: UserCog, active:false,
            children: [
                {name: "Lista de Usuarios", icon: Users},
                {name: "Agregar Usuario", icon: UserPlus},
                {name: "Roles y Permisos", icon: Shield},
            ]
        },
        {name: "Reportes", icon: ClipboardMinus, active:false,
            children: [
                {name: "Reportes de Agrupaciones", icon: FileUser},
                {name: "Reportes de Actividades", icon: Boxes},
                {name: "Reportes de Asistencia", icon: UserRoundArrowLeft},
                {name: "Reportes de Inventario", icon: UsersRound},

            ]
        },
        
    ]);
    const handleClick = (index) => {
        setLinks(prev =>prev.map((link,i)=>{
            if(i === index){
                if(link.children){
                    return {...link, open: !link.open};
                }
                return{ ...link, active: true}
            }
            return link.children ? {...link, active:false} : {...link,active:false};
        }));
    };
    const handleChildClick = (childName) => {
        onSelectView?.(childName);
        if(onCloseDrawer && window.innerWidth < 789) onCloseDrawer();
    };
    return (
        <aside className="print:hidden fixed left-0 top-0 h-screen bg-white dark:bg-rail overflow-hidden shadow-lg w-56 z-20 lg:mt-0 mt-14 flex flex-col">
            <div className="h-16 flex items-center justify-center px-4 border-b border-border dark:border-white/10">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Logo" className="w-10 h-10 object-cover rounded-md shrink-0 "/>
                        <h1 className="text-3xl font-bold text-foreground dark:text-white leading-none tracking-tight">
                        SGAC
                        </h1>
                </div>
            </div>
            {/* Navegacion */}
            <nav className="flex-1 p-4 overflow-auto">
                <ul className="space-y-1">
                    {links.map((link,index)=>(
                        <li key={index}>
                            <button onClick={()=> handleClick(index)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                link.active
                                    ? `bg-primary/15 text-primary border-l-2 border-primary`
                                    : `text-foreground-soft dark:text-white/70 hover:bg-primary/10 dark:hover:bg-white/10`
                                }`}>
                                <span className="flex-1 text-left text-sm font-medium"> {link.name}</span>
                                {link.badge && (
                                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                        {link.badge}
                                    </span>
                                )}
                                {link.children && (
                                    <span className="text-primary">
                                        {link.open ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                    </span>
                                )}
                            </button>
                            {link.children && link.open && (
                                <ul className="ml-2 mt-1 space-y-1 border-l border-border dark:border-white/10 pl-3">
                                    {link.children.map((child,childIndex)=> (
                                        <li key={childIndex}>
                                            <button onClick={()=> handleChildClick(child.name)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                child.name === selectedView
                                                    ? 'bg-primary/15 text-primary'
                                                    : 'text-foreground-soft dark:text-white/70 hover:bg-primary/10 dark:hover:bg-white/10'
                                                }`}>
                                                <child.icon className="w-4 h-4 text-primary"/>
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