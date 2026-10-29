<?php

namespace App\Modules\Beneficios\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;

trait EliminaSiNoEstaEnUso
{
    /**
     * Código de MariaDB/MySQL al borrar una fila referenciada por una FK.
     */
    private const ERROR_FK_EN_USO = 1451;

    /**
     * Elimina el elemento del catálogo o responde 409 si alguna tabla lo
     * referencia (asignaciones y tablas heredadas de solicitudes), en lugar
     * de dejar que la violación de la FK llegue como error 500.
     */
    private function eliminarSiNoEstaEnUso(Model $modelo, string $mensaje): void
    {
        try {
            $modelo->delete();
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) !== self::ERROR_FK_EN_USO) {
                throw $e;
            }

            throw new HttpResponseException(response()->json([
                'message' => $mensaje,
            ], 409));
        }
    }
}
