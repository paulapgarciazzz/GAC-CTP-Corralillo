<?php

namespace App\Modules\Usuarios\Resources;

use App\Modules\Usuarios\Support\Modulos;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $roles = $this->roles->pluck('name')->values();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'foto' => $this->foto,
            'activo' => (bool) $this->activo,
            'es_admin' => $roles->contains(Modulos::ROL_ADMIN),
            'roles' => $roles,
            'permissions' => $this->permissions->pluck('name')->values(),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
