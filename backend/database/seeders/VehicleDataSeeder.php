<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VehicleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'Toyota' => ['Corolla', 'Camry', 'Rav4', 'Hilux', 'Land Cruiser', 'Avalon', 'Vitz', 'Yaris', 'Prius', 'Highlander', 'Tacoma', 'Tundra'],
            'Honda' => ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Odyssey', 'Ridgeline', 'Insight'],
            'Nissan' => ['Altima', 'Sentra', 'Maxima', 'Rogue', 'Pathfinder', 'Patrol', 'Navara', '370Z', 'GT-R', 'Leaf', 'Versa', 'Murano'],
            'Mercedes-Benz' => ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'GLA', 'GLS', 'A-Class', 'CLA', 'G-Wagon', 'AMG GT'],
            'BMW' => ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6', 'X7', 'M3', 'M4', 'M5', 'i3', 'i8', 'Z4'],
            'Ford' => ['F-150', 'Ranger', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Focus', 'Fiesta', 'EcoSport', 'Expedition', 'Transit'],
            'Hyundai' => ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Palisade', 'Accent', 'Ioniq', 'Veloster'],
            'Kia' => ['Rio', 'Forte', 'Optima', 'K5', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'Stinger', 'Seltos'],
            'Volkswagen' => ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Touareg', 'Polo', 'Arteon', 'ID.4', 'Amarok'],
            'Audi' => ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT', 'R8'],
            'Lexus' => ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX', 'LC', 'RC'],
            'Land Rover' => ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery', 'Discovery Sport', 'Defender'],
            'Jeep' => ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator'],
            'Chevrolet' => ['Silverado', 'Equinox', 'Malibu', 'Cruze', 'Tahoe', 'Suburban', 'Camaro', 'Corvette', 'Colorado', 'Traverse'],
            'Mazda' => ['Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-9', 'MX-5 Miata'],
            'Mitsubishi' => ['Lancer', 'Pajero', 'Outlander', 'ASX', 'Eclipse Cross', 'Mirage', 'Triton'],
            'Subaru' => ['Impreza', 'Legacy', 'Forester', 'Outback', 'Crosstrek', 'Ascent', 'WRX', 'BRZ'],
            'Volvo' => ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
            'Suzuki' => ['Swift', 'Vitara', 'Jimny', 'Alto', 'Ertiga', 'Baleno', 'Dzire'],
            'Isuzu' => ['D-MAX', 'MU-X'],
            'Peugeot' => ['208', '308', '508', '2008', '3008', '5008'],
            'Renault' => ['Clio', 'Megane', 'Koleos', 'Kadjar', 'Captur', 'Duster'],
            'Porsche' => ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Cayman', '718 Boxster'],
        ];

        foreach ($data as $makeName => $models) {
            $make = \App\Models\VehicleMake::create([
                'name' => $makeName,
                'slug' => \Illuminate\Support\Str::slug($makeName),
            ]);

            foreach ($models as $modelName) {
                \App\Models\VehicleModel::create([
                    'vehicle_make_id' => $make->id,
                    'name' => $modelName,
                    'slug' => \Illuminate\Support\Str::slug($modelName),
                ]);
            }
        }
    }
}
