-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 17, 2026 at 03:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `perfectservice`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(255) NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `reason` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `severity` varchar(255) NOT NULL DEFAULT 'info',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `reason`, `ip_address`, `user_agent`, `severity`, `created_at`, `updated_at`) VALUES
(1, NULL, 'user_login', 'user', 4, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'info', '2026-02-17 14:16:47', '2026-02-17 14:16:47'),
(2, 4, 'user_logout', 'user', 4, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'info', '2026-02-17 14:17:31', '2026-02-17 14:17:31'),
(3, NULL, 'user_login', 'user', 1, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'info', '2026-02-17 14:18:36', '2026-02-17 14:18:36'),
(4, 1, 'user_logout', 'user', 1, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'info', '2026-02-17 14:26:22', '2026-02-17 14:26:22');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_closings`
--

CREATE TABLE `daily_closings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `closing_date` date NOT NULL,
  `cash_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `momo_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `expected_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `actual_cash` decimal(12,2) DEFAULT NULL,
  `actual_momo` decimal(12,2) DEFAULT NULL,
  `discrepancy` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_invoices` int(11) NOT NULL DEFAULT 0,
  `total_job_cards` int(11) NOT NULL DEFAULT 0,
  `service_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`service_breakdown`)),
  `status` enum('open','closed','flagged') NOT NULL DEFAULT 'open',
  `notes` text DEFAULT NULL,
  `flag_reason` text DEFAULT NULL,
  `closed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_closings`
--

INSERT INTO `daily_closings` (`id`, `closing_date`, `cash_total`, `momo_total`, `expected_total`, `actual_cash`, `actual_momo`, `discrepancy`, `total_invoices`, `total_job_cards`, `service_breakdown`, `status`, `notes`, `flag_reason`, `closed_by`, `closed_at`, `created_at`, `updated_at`) VALUES
(1, '2026-02-17', 0.00, 0.00, 0.00, NULL, NULL, 0.00, 0, 0, '[]', 'open', NULL, NULL, NULL, NULL, '2026-02-17 14:19:24', '2026-02-17 14:19:24');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_number` varchar(255) NOT NULL,
  `job_card_id` bigint(20) UNSIGNED NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance_due` decimal(12,2) NOT NULL,
  `status` enum('draft','issued','partial','paid','void') NOT NULL DEFAULT 'draft',
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_cards`
--

CREATE TABLE `job_cards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `job_number` varchar(255) NOT NULL,
  `vehicle_number` varchar(255) NOT NULL,
  `vehicle_make` varchar(255) DEFAULT NULL,
  `vehicle_model` varchar(255) DEFAULT NULL,
  `vehicle_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vehicle_year` varchar(4) DEFAULT NULL,
  `vehicle_color` varchar(255) DEFAULT NULL,
  `mileage` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `technician` varchar(255) NOT NULL,
  `status` enum('open','in_progress','completed','invoiced','cancelled') NOT NULL DEFAULT 'open',
  `notes` text DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_card_items`
--

CREATE TABLE `job_card_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `job_card_id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `agreed_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `line_total` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_01_01_000001_create_roles_table', 1),
(5, '2024_01_01_000002_add_role_to_users_table', 1),
(6, '2024_01_01_000003_create_services_table', 1),
(7, '2024_01_01_000004_create_job_cards_table', 1),
(8, '2024_01_01_000005_create_job_card_items_table', 1),
(9, '2024_01_01_000006_create_invoices_table', 1),
(10, '2024_01_01_000007_create_invoice_items_table', 1),
(11, '2024_01_01_000008_create_payments_table', 1),
(12, '2024_01_01_000009_create_audit_logs_table', 1),
(13, '2024_01_01_000010_create_daily_closings_table', 1),
(14, '2024_01_01_000011_create_system_settings_table', 1),
(15, '2026_02_15_212806_create_personal_access_tokens_table', 1),
(16, '2026_02_15_224320_create_vehicle_makes_table', 1),
(17, '2026_02_15_224321_create_vehicle_models_table', 1),
(18, '2026_02_15_230258_add_soft_deletes_to_services_and_job_cards_table', 1),
(19, '2026_02_15_232411_create_customers_table', 1),
(20, '2026_02_15_232413_add_customer_id_to_job_cards', 1),
(21, '2026_02_16_000810_create_vehicle_types_table', 1),
(22, '2026_02_16_000811_create_service_pricings_table', 1),
(23, '2026_02_16_000813_add_vehicle_type_id_to_tables', 1),
(24, '2026_02_17_124120_add_manager_feedback_to_job_cards_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `method` enum('cash','momo') NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `momo_phone` varchar(255) DEFAULT NULL,
  `received_by` bigint(20) UNSIGNED NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `display_name`, `permissions`, `created_at`, `updated_at`) VALUES
(1, 'cash_officer', 'Cash Officer', '[\"view_invoices\",\"create_invoices\",\"record_payments\",\"view_job_cards\",\"view_daily_closings\",\"create_daily_closings\"]', '2026-02-17 14:14:18', '2026-02-17 14:14:18'),
(2, 'service_advisor', 'Service Advisor', '[\"view_job_cards\",\"create_job_cards\",\"edit_job_cards\",\"update_job_card_status\",\"view_services\",\"view_invoices\"]', '2026-02-17 14:14:18', '2026-02-17 14:14:18'),
(3, 'manager', 'Manager / Owner', '[\"view_invoices\",\"create_invoices\",\"void_invoices\",\"record_payments\",\"view_job_cards\",\"create_job_cards\",\"edit_job_cards\",\"update_job_card_status\",\"approve_job_cards\",\"view_services\",\"manage_services\",\"manage_pricing\",\"apply_discounts\",\"override_pricing\",\"view_audit_logs\",\"view_daily_closings\",\"create_daily_closings\",\"resolve_daily_closings\",\"manage_users\",\"manage_settings\",\"view_reports\"]', '2026-02-17 14:14:18', '2026-02-17 14:14:18'),
(4, 'technician', 'Technician', '[\"view_job_cards\",\"update_job_card_status\"]', '2026-02-17 14:14:18', '2026-02-17 14:14:18');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `min_price` decimal(10,2) NOT NULL,
  `max_price` decimal(10,2) NOT NULL,
  `fixed_price` decimal(10,2) DEFAULT NULL,
  `is_fixed` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `category`, `min_price`, `max_price`, `fixed_price`, `is_fixed`, `is_active`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Oil Change', 'Maintenance', 80.00, 150.00, NULL, 0, 1, 'Engine oil and filter replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(2, 'Oil Filter Replacement', 'Maintenance', 30.00, 60.00, NULL, 0, 1, 'Oil filter change only', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(3, 'Air Filter Replacement', 'Maintenance', 40.00, 80.00, NULL, 0, 1, 'Engine air filter replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(4, 'Spark Plug Replacement', 'Maintenance', 60.00, 200.00, NULL, 0, 1, 'Replace spark plugs (set)', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(5, 'Coolant Flush', 'Maintenance', 100.00, 250.00, NULL, 0, 1, 'Complete coolant system flush and refill', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(6, 'Brake Pad Replacement (Front)', 'Brakes', 200.00, 500.00, NULL, 0, 1, 'Front brake pad replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(7, 'Brake Pad Replacement (Rear)', 'Brakes', 200.00, 500.00, NULL, 0, 1, 'Rear brake pad replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(8, 'Brake Disc Turning', 'Brakes', 100.00, 300.00, NULL, 0, 1, 'Brake disc resurfacing', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(9, 'Brake Fluid Change', 'Brakes', 60.00, 120.00, NULL, 0, 1, 'Complete brake fluid flush', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(10, 'Wheel Alignment', 'Suspension', 100.00, 100.00, 100.00, 1, 1, 'Four-wheel alignment', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(11, 'Wheel Balancing', 'Suspension', 60.00, 60.00, 60.00, 1, 1, 'Four-wheel balancing', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(12, 'Shock Absorber Replacement', 'Suspension', 300.00, 800.00, NULL, 0, 1, 'Per shock absorber replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(13, 'AC Regas', 'Electrical', 150.00, 300.00, NULL, 0, 1, 'Air conditioning regas and leak check', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(14, 'Battery Replacement', 'Electrical', 200.00, 600.00, NULL, 0, 1, 'Car battery replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(15, 'Diagnostic Scan', 'Electrical', 50.00, 50.00, 50.00, 1, 1, 'OBD-II diagnostic scan', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(16, 'Alternator Repair', 'Electrical', 200.00, 500.00, NULL, 0, 1, 'Alternator repair or replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(17, 'Starter Motor Repair', 'Electrical', 200.00, 600.00, NULL, 0, 1, 'Starter motor repair or replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(18, 'Full Body Spray', 'Body', 2000.00, 5000.00, NULL, 0, 1, 'Complete vehicle respray', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(19, 'Panel Beating', 'Body', 300.00, 2000.00, NULL, 0, 1, 'Dent repair and panel work', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(20, 'Windshield Replacement', 'Body', 400.00, 1500.00, NULL, 0, 1, 'Windshield glass replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(21, 'Tire Rotation', 'Tires', 40.00, 80.00, NULL, 0, 1, 'Rotate all four tires', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(22, 'Tire Repair (Puncture)', 'Tires', 20.00, 50.00, NULL, 0, 1, 'Tire puncture repair', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(23, 'Tire Replacement', 'Tires', 150.00, 800.00, NULL, 0, 1, 'Single tire replacement (price varies by size)', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(24, 'Engine Tune-Up', 'Engine', 300.00, 800.00, NULL, 0, 1, 'Complete engine tune-up', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(25, 'Timing Belt Replacement', 'Engine', 500.00, 1500.00, NULL, 0, 1, 'Timing belt/chain replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(26, 'Head Gasket Replacement', 'Engine', 800.00, 3000.00, NULL, 0, 1, 'Cylinder head gasket replacement', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL),
(27, 'Transmission Service', 'Engine', 200.00, 500.00, NULL, 0, 1, 'Transmission fluid change and service', '2026-02-17 14:14:19', '2026-02-17 14:14:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `service_pricings`
--

CREATE TABLE `service_pricings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_type_id` bigint(20) UNSIGNED NOT NULL,
  `min_price` decimal(10,2) NOT NULL,
  `max_price` decimal(10,2) NOT NULL,
  `fixed_price` decimal(10,2) DEFAULT NULL,
  `is_fixed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_pricings`
--

INSERT INTO `service_pricings` (`id`, `service_id`, `vehicle_type_id`, `min_price`, `max_price`, `fixed_price`, `is_fixed`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 80.00, 150.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(2, 1, 2, 100.00, 190.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(3, 1, 3, 110.00, 205.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(4, 1, 4, 120.00, 225.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(5, 2, 1, 30.00, 60.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(6, 2, 2, 40.00, 75.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(7, 2, 3, 45.00, 85.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(8, 2, 4, 45.00, 90.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(9, 3, 1, 40.00, 80.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(10, 3, 2, 50.00, 100.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(11, 3, 3, 55.00, 110.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(12, 3, 4, 60.00, 120.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(13, 4, 1, 60.00, 200.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(14, 4, 2, 75.00, 250.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(15, 4, 3, 85.00, 270.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(16, 4, 4, 90.00, 300.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(17, 5, 1, 100.00, 250.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(18, 5, 2, 125.00, 315.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(19, 5, 3, 135.00, 340.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(20, 5, 4, 150.00, 375.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(21, 6, 1, 200.00, 500.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(22, 6, 2, 250.00, 625.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(23, 6, 3, 270.00, 675.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(24, 6, 4, 300.00, 750.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(25, 7, 1, 200.00, 500.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(26, 7, 2, 250.00, 625.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(27, 7, 3, 270.00, 675.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(28, 7, 4, 300.00, 750.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(29, 8, 1, 100.00, 300.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(30, 8, 2, 125.00, 375.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(31, 8, 3, 135.00, 405.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(32, 8, 4, 150.00, 450.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(33, 9, 1, 60.00, 120.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(34, 9, 2, 75.00, 150.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(35, 9, 3, 85.00, 165.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(36, 9, 4, 90.00, 180.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(37, 10, 1, 100.00, 100.00, 100.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(38, 10, 2, 125.00, 125.00, 125.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(39, 10, 3, 135.00, 135.00, 135.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(40, 10, 4, 150.00, 150.00, 150.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(41, 11, 1, 60.00, 60.00, 60.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(42, 11, 2, 75.00, 75.00, 75.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(43, 11, 3, 85.00, 85.00, 85.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(44, 11, 4, 90.00, 90.00, 90.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(45, 12, 1, 300.00, 800.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(46, 12, 2, 375.00, 1000.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(47, 12, 3, 405.00, 1080.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(48, 12, 4, 450.00, 1200.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(49, 13, 1, 150.00, 300.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(50, 13, 2, 190.00, 375.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(51, 13, 3, 205.00, 405.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(52, 13, 4, 225.00, 450.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(53, 14, 1, 200.00, 600.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(54, 14, 2, 250.00, 750.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(55, 14, 3, 270.00, 810.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(56, 14, 4, 300.00, 900.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(57, 15, 1, 50.00, 50.00, 50.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(58, 15, 2, 65.00, 65.00, 65.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(59, 15, 3, 70.00, 70.00, 70.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(60, 15, 4, 75.00, 75.00, 75.00, 1, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(61, 16, 1, 200.00, 500.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(62, 16, 2, 250.00, 625.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(63, 16, 3, 270.00, 675.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(64, 16, 4, 300.00, 750.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(65, 17, 1, 200.00, 600.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(66, 17, 2, 250.00, 750.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(67, 17, 3, 270.00, 810.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(68, 17, 4, 300.00, 900.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(69, 18, 1, 2000.00, 5000.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(70, 18, 2, 2500.00, 6250.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(71, 18, 3, 2700.00, 6750.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(72, 18, 4, 3000.00, 7500.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(73, 19, 1, 300.00, 2000.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(74, 19, 2, 375.00, 2500.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(75, 19, 3, 405.00, 2700.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(76, 19, 4, 450.00, 3000.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(77, 20, 1, 400.00, 1500.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(78, 20, 2, 500.00, 1875.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(79, 20, 3, 540.00, 2030.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(80, 20, 4, 600.00, 2250.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(81, 21, 1, 40.00, 80.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(82, 21, 2, 50.00, 100.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(83, 21, 3, 55.00, 110.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(84, 21, 4, 60.00, 120.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(85, 22, 1, 20.00, 50.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(86, 22, 2, 25.00, 65.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(87, 22, 3, 30.00, 70.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(88, 22, 4, 30.00, 75.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(89, 23, 1, 150.00, 800.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(90, 23, 2, 190.00, 1000.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(91, 23, 3, 205.00, 1080.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(92, 23, 4, 225.00, 1200.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(93, 24, 1, 300.00, 800.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(94, 24, 2, 375.00, 1000.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(95, 24, 3, 405.00, 1080.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(96, 24, 4, 450.00, 1200.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(97, 25, 1, 500.00, 1500.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(98, 25, 2, 625.00, 1875.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(99, 25, 3, 675.00, 2030.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(100, 25, 4, 750.00, 2250.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(101, 26, 1, 800.00, 3000.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(102, 26, 2, 1000.00, 3750.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(103, 26, 3, 1080.00, 4055.00, NULL, 0, '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(104, 26, 4, 1200.00, 4500.00, NULL, 0, '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(105, 27, 1, 200.00, 500.00, NULL, 0, '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(106, 27, 2, 250.00, 625.00, NULL, 0, '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(107, 27, 3, 270.00, 675.00, NULL, 0, '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(108, 27, 4, 300.00, 750.00, NULL, 0, '2026-02-17 14:14:20', '2026-02-17 14:14:20');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('hQlZPZJbBzx5kh60uPwg14QUB8y4KvsxDkU8kfbJ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN0NRbjdpTHR4Q2gyYWhRa0FPSHRjNEtNNHhqRkk3Q0xiWmRaVlpDQyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMS9hcGkvc2V0dGluZ3MiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1771338382);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'string',
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `key`, `value`, `type`, `is_locked`, `group`, `description`, `created_at`, `updated_at`) VALUES
(1, 'receipt_footer_line_1', 'Prices are subject to inspection.', 'string', 1, 'receipt', 'Receipt footer line 1 — locked by system policy', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(2, 'receipt_footer_line_2', 'Customer-supplied parts carry no warranty.', 'string', 1, 'receipt', 'Receipt footer line 2 — locked by system policy', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(3, 'receipt_footer_line_3', 'Full payment required before vehicle release.', 'string', 1, 'receipt', 'Receipt footer line 3 — locked by system policy', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(4, 'business_name', 'PerfectService Auto', 'string', 0, 'business', 'Business name displayed on receipts and invoices', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(5, 'business_phone', '', 'string', 0, 'business', 'Business phone number', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(6, 'business_address', '', 'string', 0, 'business', 'Business physical address', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(7, 'business_email', '', 'string', 0, 'business', 'Business email address', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(8, 'max_discount_percent', '10', 'integer', 1, 'pricing', 'Maximum discount percentage allowed — locked by system policy', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(9, 'default_tax_percent', '0', 'integer', 0, 'pricing', 'Default VAT/tax percentage for invoices', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(10, 'currency', 'GHS', 'string', 1, 'general', 'System currency — Ghana Cedi', '2026-02-17 14:14:20', '2026-02-17 14:14:20'),
(11, 'currency_symbol', 'GH₵', 'string', 1, 'general', 'Currency symbol for display', '2026-02-17 14:14:20', '2026-02-17 14:14:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `pin` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `email_verified_at`, `password`, `pin`, `is_active`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 3, 'Admin Manager', 'manager@perfectservice.com', NULL, '$2y$12$FoMAIanbfhvVcWLYj.NNT.Rgs3mJzwKmRdiLheuw5zP9kUZuccwYq', '$2y$12$K74CalnIk9ZCDLBy7g4KYeny2KcR3NU6iKGC2Y/SeTHO7Ab3nWNFu', 1, NULL, '2026-02-17 14:14:21', '2026-02-17 14:14:21', NULL),
(2, 1, 'Cash Officer', 'cashier@perfectservice.com', NULL, '$2y$12$bVQFl6mAqnVPGc.70L6lruNq1I8Lu97fP.dcFkpVTj94SkGmemypC', NULL, 1, NULL, '2026-02-17 14:14:21', '2026-02-17 14:14:21', NULL),
(3, 2, 'Service Advisor', 'advisor@perfectservice.com', NULL, '$2y$12$icPwIemGq.yEq54rW563yeTxky/Vz/xQqEIZq/NkJA0LXTrx.K2Ym', NULL, 1, NULL, '2026-02-17 14:14:22', '2026-02-17 14:14:22', NULL),
(4, 4, 'Lead Technician', 'tech@perfectservice.com', NULL, '$2y$12$mqst6Va.B7Y09cJSHkzrzOfcUdWiGxtJLF.IC0IZRbr/t.Tm1zz0a', NULL, 1, NULL, '2026-02-17 14:14:22', '2026-02-17 14:14:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_makes`
--

CREATE TABLE `vehicle_makes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_models`
--

CREATE TABLE `vehicle_models` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_make_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `vehicle_type_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_types`
--

CREATE TABLE `vehicle_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_types`
--

INSERT INTO `vehicle_types` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Saloon', 'saloon', '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(2, 'SUV / Crossover', 'suv', '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(3, 'Pickup / 4x4', 'pickup', '2026-02-17 14:14:19', '2026-02-17 14:14:19'),
(4, 'Truck / Van', 'truck', '2026-02-17 14:14:19', '2026-02-17 14:14:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_entity_type_entity_id_index` (`entity_type`,`entity_id`),
  ADD KEY `audit_logs_action_index` (`action`),
  ADD KEY `audit_logs_user_id_index` (`user_id`),
  ADD KEY `audit_logs_severity_index` (`severity`),
  ADD KEY `audit_logs_created_at_index` (`created_at`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customers_email_index` (`email`),
  ADD KEY `customers_phone_index` (`phone`);

--
-- Indexes for table `daily_closings`
--
ALTER TABLE `daily_closings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `daily_closings_closing_date_unique` (`closing_date`),
  ADD KEY `daily_closings_closed_by_foreign` (`closed_by`),
  ADD KEY `daily_closings_closing_date_index` (`closing_date`),
  ADD KEY `daily_closings_status_index` (`status`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  ADD KEY `invoices_created_by_foreign` (`created_by`),
  ADD KEY `invoices_voided_by_foreign` (`voided_by`),
  ADD KEY `invoices_status_index` (`status`),
  ADD KEY `invoices_created_at_index` (`created_at`),
  ADD KEY `invoices_job_card_id_index` (`job_card_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_items_service_id_foreign` (`service_id`),
  ADD KEY `invoice_items_invoice_id_index` (`invoice_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_cards`
--
ALTER TABLE `job_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_cards_job_number_unique` (`job_number`),
  ADD KEY `job_cards_created_by_foreign` (`created_by`),
  ADD KEY `job_cards_approved_by_foreign` (`approved_by`),
  ADD KEY `job_cards_status_index` (`status`),
  ADD KEY `job_cards_vehicle_number_index` (`vehicle_number`),
  ADD KEY `job_cards_customer_phone_index` (`customer_phone`),
  ADD KEY `job_cards_created_at_index` (`created_at`),
  ADD KEY `job_cards_customer_id_foreign` (`customer_id`),
  ADD KEY `job_cards_vehicle_type_id_foreign` (`vehicle_type_id`);

--
-- Indexes for table `job_card_items`
--
ALTER TABLE `job_card_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_card_items_service_id_foreign` (`service_id`),
  ADD KEY `job_card_items_job_card_id_index` (`job_card_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_received_by_foreign` (`received_by`),
  ADD KEY `payments_invoice_id_index` (`invoice_id`),
  ADD KEY `payments_method_index` (`method`),
  ADD KEY `payments_created_at_index` (`created_at`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `services_category_index` (`category`),
  ADD KEY `services_is_active_index` (`is_active`);

--
-- Indexes for table `service_pricings`
--
ALTER TABLE `service_pricings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_pricings_service_id_vehicle_type_id_unique` (`service_id`,`vehicle_type_id`),
  ADD KEY `service_pricings_vehicle_type_id_foreign` (`vehicle_type_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `system_settings_key_unique` (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_id_foreign` (`role_id`);

--
-- Indexes for table `vehicle_makes`
--
ALTER TABLE `vehicle_makes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicle_makes_name_unique` (`name`),
  ADD UNIQUE KEY `vehicle_makes_slug_unique` (`slug`);

--
-- Indexes for table `vehicle_models`
--
ALTER TABLE `vehicle_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicle_models_vehicle_make_id_name_unique` (`vehicle_make_id`,`name`),
  ADD UNIQUE KEY `vehicle_models_vehicle_make_id_slug_unique` (`vehicle_make_id`,`slug`),
  ADD KEY `vehicle_models_vehicle_type_id_foreign` (`vehicle_type_id`);

--
-- Indexes for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicle_types_name_unique` (`name`),
  ADD UNIQUE KEY `vehicle_types_slug_unique` (`slug`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_closings`
--
ALTER TABLE `daily_closings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_cards`
--
ALTER TABLE `job_cards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_card_items`
--
ALTER TABLE `job_card_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `service_pricings`
--
ALTER TABLE `service_pricings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `vehicle_makes`
--
ALTER TABLE `vehicle_makes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicle_models`
--
ALTER TABLE `vehicle_models`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `daily_closings`
--
ALTER TABLE `daily_closings`
  ADD CONSTRAINT `daily_closings_closed_by_foreign` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `invoices_job_card_id_foreign` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`),
  ADD CONSTRAINT `invoices_voided_by_foreign` FOREIGN KEY (`voided_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_items_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `job_cards`
--
ALTER TABLE `job_cards`
  ADD CONSTRAINT `job_cards_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `job_cards_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `job_cards_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `job_cards_vehicle_type_id_foreign` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `job_card_items`
--
ALTER TABLE `job_card_items`
  ADD CONSTRAINT `job_card_items_job_card_id_foreign` FOREIGN KEY (`job_card_id`) REFERENCES `job_cards` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `job_card_items_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
  ADD CONSTRAINT `payments_received_by_foreign` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `service_pricings`
--
ALTER TABLE `service_pricings`
  ADD CONSTRAINT `service_pricings_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_pricings_vehicle_type_id_foreign` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `vehicle_models`
--
ALTER TABLE `vehicle_models`
  ADD CONSTRAINT `vehicle_models_vehicle_make_id_foreign` FOREIGN KEY (`vehicle_make_id`) REFERENCES `vehicle_makes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vehicle_models_vehicle_type_id_foreign` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
