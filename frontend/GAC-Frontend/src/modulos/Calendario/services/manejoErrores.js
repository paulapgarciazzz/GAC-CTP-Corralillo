export const extraerMensajeError = (error, fallback) =>
    error.response?.data?.message
    || Object.values(error.response?.data?.errors || {})[0]?.[0]
    || fallback;

export const manejarError = (error, fallback) => ({
    success: false,
    error: extraerMensajeError(error, fallback),
    errors: error.response?.data?.errors ?? {},
});
