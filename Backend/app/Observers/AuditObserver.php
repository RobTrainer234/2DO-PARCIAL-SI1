<?php

namespace App\Observers;

use Illuminate\Support\Str;
use App\Models\AuditLog;

class AuditObserver
{
    protected function createLog($model, string $action)
    {
        try {
            $before = null;
            $after = method_exists($model, 'toAuditArray') ? $model->toAuditArray() : $model->attributesToArray();

            $usuarioId = null;
            if (auth()->check()) {
                $usuarioId = auth()->id();
            }

            $ip = null;
            $ua = null;
            if (function_exists('request')) {
                $req = request();
                if ($req) {
                    $ip = $req->ip();
                    $ua = $req->userAgent();
                }
            }

            AuditLog::create([
                'usuario_id' => $usuarioId,
                'accion' => strtoupper($action),
                'entidad' => Str::afterLast(get_class($model), '\\'),
                'entidad_id' => (string) ($model->getKey() ?? null),
                'antes' => $before,
                'despues' => $after,
                'ip' => $ip,
                'user_agent' => $ua,
            ]);
        } catch (\Throwable $e) {
            // no lanzar excepción desde el observer; registrar en log si es necesario
            logger()->error('AuditObserver error: ' . $e->getMessage());
        }
    }

    public function created($model)
    {
        $this->createLog($model, 'created');
    }

    public function updated($model)
    {
        $this->createLog($model, 'updated');
    }

    public function deleted($model)
    {
        $this->createLog($model, 'deleted');
    }
}
