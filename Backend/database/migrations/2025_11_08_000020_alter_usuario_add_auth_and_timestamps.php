<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('Usuario')) {
            // If the base Usuario table doesn't exist yet, skip this migration.
            return;
        }

        Schema::table('Usuario', function (Blueprint $table) {
            if (!Schema::hasColumn('Usuario', 'password')) {
                $table->string('password')->nullable();
            }
            if (!Schema::hasColumn('Usuario', 'remember_token')) {
                $table->string('remember_token', 100)->nullable();
            }
            if (!Schema::hasColumn('Usuario', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable();
            }
            if (!Schema::hasColumn('Usuario', 'created_at')) {
                $table->timestamp('created_at')->useCurrent();
            }
            if (!Schema::hasColumn('Usuario', 'updated_at')) {
                $table->timestamp('updated_at')->useCurrent()->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('Usuario', function (Blueprint $table) {
            $table->dropColumn(['password','remember_token','email_verified_at','created_at','updated_at']);
        });
    }
};
