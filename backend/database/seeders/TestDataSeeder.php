<?php

namespace Database\Seeders;

use App\Models\JobCard;
use App\Models\JobCardItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $managerRole = Role::where('name', 'manager')->first();
        $user = User::where('role_id', $managerRole?->id)->first();
        if (!$user) {
            $user = User::first();
        }
        if (!$user) {
            $this->command->error('No manager user found. Run DefaultUserSeeder first.');
            return;
        }

        $services = Service::all();
        if ($services->isEmpty()) {
            $this->command->error('No services found. Run ServiceSeeder first.');
            return;
        }

        $vehicles = [
            ['number' => 'GR-1234-24', 'make' => 'Toyota', 'model' => 'Corolla', 'color' => 'White', 'year' => '2021', 'customer' => 'Kwame Mensah', 'phone' => '0244123456'],
            ['number' => 'AS-5678-23', 'make' => 'Honda', 'model' => 'Civic', 'color' => 'Silver', 'year' => '2020', 'customer' => 'Ama Serwaa', 'phone' => '0201234567'],
            ['number' => 'GT-9012-22', 'make' => 'BMW', 'model' => '3 Series', 'color' => 'Black', 'year' => '2022', 'customer' => 'Kofi Asante', 'phone' => '0551234567'],
            ['number' => 'GN-3456-21', 'make' => 'Mercedes-Benz', 'model' => 'C-Class', 'color' => 'Grey', 'year' => '2019', 'customer' => 'Akua Boateng', 'phone' => '0241112233'],
            ['number' => 'GW-7890-24', 'make' => 'Toyota', 'model' => 'Hilux', 'color' => 'Red', 'year' => '2023', 'customer' => 'Yaw Darko', 'phone' => '0271234567'],
            ['number' => 'GR-2468-23', 'make' => 'Nissan', 'model' => 'Patrol', 'color' => 'White', 'year' => '2020', 'customer' => 'Adwoa Amponsah', 'phone' => '0209876543'],
            ['number' => 'BA-1357-22', 'make' => 'Ford', 'model' => 'Ranger', 'color' => 'Blue', 'year' => '2021', 'customer' => 'Nana Kwadwo', 'phone' => '0557654321'],
            ['number' => 'GR-8642-24', 'make' => 'Hyundai', 'model' => 'Tucson', 'color' => 'Black', 'year' => '2022', 'customer' => 'Efua Ankoma', 'phone' => '0241237890'],
            ['number' => 'AS-3691-23', 'make' => 'Kia', 'model' => 'Sportage', 'color' => 'White', 'year' => '2023', 'customer' => 'Kwesi Owusu', 'phone' => '0271239876'],
            ['number' => 'GT-1593-22', 'make' => 'Land Rover', 'model' => 'Discovery', 'color' => 'Green', 'year' => '2021', 'customer' => 'Aba Nyamekye', 'phone' => '0551236789'],
        ];

        $technicians = ['Isaac Osei', 'Samuel Adu', 'Emmanuel Tetteh', 'Daniel Ofori'];
        $statuses = ['open', 'in_progress', 'completed', 'invoiced'];

        $this->command->info('Starting to seed ' . count($vehicles) . ' job cards...');

        foreach ($vehicles as $i => $v) {
            try {
                $status = $statuses[$i % count($statuses)];
                $techIndex = $i % count($technicians);

                $this->command->info("Processing index {$i}. Status: {$status}.");

                $jobCard = JobCard::create([
                    'job_number' => JobCard::generateJobNumber(),
                    'vehicle_number' => $v['number'],
                    'vehicle_make' => $v['make'],
                    'vehicle_model' => $v['model'],
                    'vehicle_year' => $v['year'],
                    'vehicle_color' => $v['color'],
                    'customer_name' => $v['customer'],
                    'customer_phone' => $v['phone'],
                    'technician' => $technicians[$techIndex],
                    'status' => $status === 'invoiced' ? 'completed' : $status,
                    'notes' => 'Regular service check - test data',
                    'created_by' => $user->id,
                ]);

                // Add 2-3 service items per job
                $jobServices = $services->random(rand(2, min(3, $services->count())));
                foreach ($jobServices as $service) {
                    $price = $service->is_fixed
                        ? $service->fixed_price
                        : rand((int) $service->min_price, (int) $service->max_price);

                    JobCardItem::create([
                        'job_card_id' => $jobCard->id,
                        'service_id' => $service->id,
                        'quantity' => 1,
                        'agreed_price' => $price,
                        'line_total' => $price,
                        'notes' => $service->name, // Store name in notes as fallback/reference
                    ]);
                }

                // Create invoices for "invoiced" status jobs
                if ($status === 'invoiced') {
                    $this->command->info("Creating invoice for job {$jobCard->id}...");
                    $jobCard->update(['status' => 'invoiced']);
                    $total = $jobCard->items()->sum('line_total');

                    $invoice = Invoice::create([
                        'invoice_number' => Invoice::generateInvoiceNumber(),
                        'job_card_id' => $jobCard->id,
                        'subtotal' => $total,
                        'tax_percent' => 0,
                        'tax_amount' => 0,
                        'discount_amount' => 0,
                        'total' => $total,
                        'amount_paid' => $total,
                        'balance_due' => 0,
                        'status' => 'paid',
                        'created_by' => $user->id,
                    ]);

                    // Copy job card items to invoice items
                    $jobCard->load('items.service'); // Ensure services are loaded
                    foreach ($jobCard->items as $item) {
                        InvoiceItem::create([
                            'invoice_id' => $invoice->id,
                            'service_id' => $item->service_id,
                            'description' => $item->service?->name ?? 'Service Item',
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'line_total' => $item->line_total,
                        ]);
                    }

                    // Record a payment
                    Payment::create([
                        'invoice_id' => $invoice->id,
                        'amount' => $total,
                        'method' => ['cash', 'momo'][rand(0, 1)],
                        'reference' => 'TEST-' . strtoupper(substr(md5(rand()), 0, 8)),
                        'received_by' => $user->id,
                    ]);
                }
            } catch (\Exception $e) {
                $this->command->error("Failed to seed record {$i}: " . $e->getMessage());
            }
        }

        $this->command->info('Test data created: 10 job cards with services, invoices, and payments.');
    }
}
