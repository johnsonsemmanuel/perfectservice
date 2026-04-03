<?php

namespace App\Exceptions;

use App\Models\Service;

/**
 * Thrown when a price exceeds the allowed MIN–MAX range for a service.
 */
class PriceOutOfRangeException extends \RuntimeException
{
    public function __construct(
        string $message,
        public readonly Service $service,
        public readonly float $attemptedPrice,
        int $code = 422,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
