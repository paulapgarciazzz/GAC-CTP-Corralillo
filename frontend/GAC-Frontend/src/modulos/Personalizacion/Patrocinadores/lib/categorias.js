// Debe coincidir con Rule::in(...) de StorePatrocinadorRequest / UpdatePatrocinadorRequest.
export const CATEGORIAS = [
    { value: 'principal', label: 'Principal' },
    { value: 'oro', label: 'Oro' },
    { value: 'plata', label: 'Plata' },
    { value: 'colaborador', label: 'Colaborador' },
];

export const etiquetaCategoria = (valor) =>
    CATEGORIAS.find((categoria) => categoria.value === valor)?.label ?? valor;
