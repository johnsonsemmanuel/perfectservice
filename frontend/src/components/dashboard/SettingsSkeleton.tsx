'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SettingsSkeleton() {
    return (
        <div className="w-full space-y-6">
            <Skeleton className="h-10 w-64" />

            <div className="w-full space-y-6">
                <div className="grid w-full grid-cols-3 h-10 bg-gray-100 rounded-md p-1">
                    <div className="h-full bg-white rounded-sm" />
                    <div className="h-full" />
                    <div className="h-full" />
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-8">
                        {/* Logo section skeleton */}
                        <div className="space-y-4 mb-6 border border-gray-100 p-4 rounded bg-gray-50/50">
                            <Skeleton className="h-4 w-32" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded border" />
                                <Skeleton className="h-10 flex-1 rounded-md" />
                            </div>
                        </div>

                        {/* Form fields skeleton */}
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="flex justify-end p-6 pt-0">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
