<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        return response()->json(
            VehicleMake::orderBy('name')->get()
        );
    }

    public function models(VehicleMake $vehicleMake)
    {
        return response()->json(
            $vehicleMake->models()->orderBy('name')->get()
        );
    }
}
