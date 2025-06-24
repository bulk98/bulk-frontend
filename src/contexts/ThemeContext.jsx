import React, { createContext, useState, useMemo, useContext } from 'react';

const ThemeContext = createContext({
    toggleColorMode: () => {},
    mode: 'light',
});

export const useThemeContext = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }) => {
    // Leemos la preferencia del usuario del localStorage, o usamos 'light' por defecto
    const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => {
                const newMode = prevMode === 'light' ? 'dark' : 'light';
                // Guardamos la nueva preferencia en el localStorage
                localStorage.setItem('themeMode', newMode);
                return newMode;
            });
        },
        mode,
    }), [mode]);

    return (
        <ThemeContext.Provider value={colorMode}>
            {children}
        </ThemeContext.Provider>
    );
};