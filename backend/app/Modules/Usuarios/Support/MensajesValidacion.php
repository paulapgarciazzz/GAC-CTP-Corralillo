<?php

namespace App\Modules\Usuarios\Support;

/**
 * Nombres visibles de los campos y mensajes propios de los formularios del
 * módulo. El resto de los mensajes sale de lang/es/validation.php.
 */
trait MensajesValidacion
{
    public function attributes(): array
    {
        return [
            'name' => 'nombre completo',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
            'password_actual' => 'contraseña actual',
            'activo' => 'usuario activo',
            'es_admin' => 'administrador',
            'foto' => 'foto',
            'codigo' => 'código',
            'permisos' => 'permisos',
            'permisos.*' => 'permiso',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'codigo.digits' => 'El código debe tener 6 dígitos.',
        ];
    }
}
