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
        <nav className="sticky top-0 z-20 bg-white/80 dark:bg-background/80 backdrop-blur-lg">
            <div className= "px-4 sm:px-6 py-3">
                <div className='flex items-center justify-between'>
                    <div className="flex items-center gap-3">
                        <button onClick= {onToggleDrawer} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <Menu className="w-5 h-5 text-gray-900 dark:text-gray-300"/>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center bg-gray-200 dark:bg-white/10 rounded-lg px-3 py-2 min-w-64">
                            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                            <input type="text" placeholder="Buscar..." className="ml-2 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 w-full"/>
                        </div>
                        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300"/>
                        </button>
                        <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Toggle Theme">
                            {isDark ? (
                                <Sun className="w-5 h-5 text-yellow-500"/>
                            ):(
                                <Moon className="w-5 h-5 text-gray-700"/>
                            )}
                        </button>
                        
                        {/* Perfil*/}
                        <div className="relative">
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                <img src={user} alt="User" className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-white/20"/>
                            </button>
                            {isDropdownOpen && (
                                <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}/>

                                    <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 z-20'>
                                       
                                        <div className='p-3 border-b border-gray-200 dark:border-white/10'>
                                            <p className='text-sm font-semibold text-gray-900 dark:text-white'>User</p>
                                            <p className='text-xs text-gray-500 dark:text-gray-400'>user@example.com</p>
                                        </div>
                                    <div className='p-2'>
                                        <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors'>
                                            <UserCircle className='w-4 h-4'/>
                                            Perfil
                                        </button>
                                        <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors'>
                                            <Settings className='w-4 h-4'/>
                                            Ajustes
                                        </button>
                                        <button className='flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-red-500/10 rounded-lg transition-colors'  onClick={handleGoToHome}>
                                            
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