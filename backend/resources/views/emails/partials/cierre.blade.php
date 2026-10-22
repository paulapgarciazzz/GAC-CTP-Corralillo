{{-- Textos personalizables del final del cuerpo (Personalización › Correos). --}}
@if($correo['textos']['mensaje_principal'])
<p>{{ $correo['textos']['mensaje_principal'] }}</p>
@endif

@if($correo['textos']['despedida'])
<p>{{ $correo['textos']['despedida'] }}</p>
@endif

@if($correo['textos']['firma'])
<p style="font-weight: 600;">{{ $correo['textos']['firma'] }}</p>
@endif

<hr class="divider">

@if($correo['textos']['aviso'])
<p style="color: #999; font-size: 12px;">{{ $correo['textos']['aviso'] }}</p>
@endif
