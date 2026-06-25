<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Admin extends Model
{
    protected $fillable = ['email', 'password', 'api_token'];

    protected $hidden = ['password', 'api_token'];
}
