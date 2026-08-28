import { useState } from 'react'
import { Menu, Search, Sun, Moon, UserCircle, Settings, LogOut} from 'lucide-react'
import user from '../../../assets/user.jpg'
import { useNavigate } from '@tanstack/react-router'

const Topbar = ({ isDark, onToggleDrawer, onToggleTheme }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const handleGoToHome = () => {
        navigate({ to: '/' })
    }
    
    return(
        <nav className="print:hidden sticky top-0 z-20 bg-surface/80 backdrop-blur-lg border-b border-border">
            <div className="h-16 flex items-center px-4 sm:px-6">
                <div className='flex items-center justify-between w-full'>
                    <div className="flex items-center gap-3">
                        <button onClick= {onToggleDrawer} className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors">
                            <Menu className="w-5 h-5 text-foreground"/>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        
                        <button className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors">
                            <Search className="w-5 h-5 text-foreground-soft"/>
                        </button>
                        <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Toggle Theme">
                            {isDark ? (
                                <Sun className="w-5 h-5 text-warning"/>
                            ):(
                                <Moon className="w-5 h-5 text-foreground-soft"/>
                            )}
                        </button>

                        {/* Perfil*/}
                        <div className="relative">
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/10 transition-colors">
                                <img src={user} alt="User" className="w-8 h-8 rounded-full object-cover border-2 border-border"/>
                            </button>
                            {isDropdownOpen && (
                                <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}/>

                                    <div className='absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border z-20'>

                                        <div className='p-3 border-b border-border'>
                                            <p className='text-sm font-semibold text-foreground'>User</p>
                                            <p className='text-xs text-foreground-faint'>user@example.com</p>
                                        </div>
                                    <div className='p-2'>
                                        <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors'>
                                            <UserCircle className='w-4 h-4'/>
                                            Perfil
                                        </button>
                                        <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground-soft hover:bg-primary/10 rounded-lg transition-colors'>
                                            <Settings className='w-4 h-4'/>
                                            Ajustes
                                        </button>
                                        <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-danger hover:bg-danger-soft rounded-lg transition-colors'  onClick={handleGoToHome}>
                                            
                                            <LogOut  className='w-4 h-4'/>
                                            Cerrar Sesión 
                                        </button>
                                    </div>
                                </div>
                                </>
                                
                            )}
                        </div>
                    </div>
                </div>

            </div>

        </nav>
    )
}
export default Topbar;