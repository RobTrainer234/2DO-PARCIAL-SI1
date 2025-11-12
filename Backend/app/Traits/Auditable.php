<?php

namespace App\Traits;

trait Auditable
{
    /**
     * Return an array with the model data to store in audit logs.
     */
    public function toAuditArray(): array
    {
        return $this->attributesToArray();
    }
}
