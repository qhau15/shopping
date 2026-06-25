<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không đúng'], 401);
        }

        $token = Str::random(60);
        $admin->update(['api_token' => hash('sha256', $token)]);

        return response()->json(['token' => $token]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            Admin::where('api_token', hash('sha256', $token))->update(['api_token' => null]);
        }
        return response()->json(['message' => 'Đăng xuất thành công']);
    }
}
