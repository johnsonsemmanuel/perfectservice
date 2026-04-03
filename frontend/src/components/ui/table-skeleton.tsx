'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number, rows?: number }) {
    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-10 w-full max-w-sm" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t border-gray-100">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    {Array.from({ length: columns }).map((_, i) => (
                                        <th key={i} className="px-6 py-3">
                                            <Skeleton className="h-4 w-20" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Array.from({ length: rows }).map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {Array.from({ length: columns }).map((_, colIndex) => (
                                            <td key={colIndex} className="px-6 py-4">
                                                <Skeleton className="h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
