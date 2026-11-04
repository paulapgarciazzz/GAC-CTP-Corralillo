import { useEffect, useState } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const raiz = document.documentElement;
        // Anula las transiciones durante el cambio (ver index.css): dos frames garantizan que ya se pintó el tema nuevo.
        raiz.setAttribute('data-cambiando-tema', '');
        raiz.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        let segundoFrame;
        const primerFrame = requestAnimationFrame(() => {
            segundoFrame = requestAnimationFrame(() => raiz.removeAttribute('data-cambiando-tema'));
        });
        return () => {
            cancelAnimationFrame(primerFrame);
            cancelAnimationFrame(segundoFrame);
            raiz.removeAttribute('data-cambiando-tema');
        };
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return { isDark, toggleTheme };
}
