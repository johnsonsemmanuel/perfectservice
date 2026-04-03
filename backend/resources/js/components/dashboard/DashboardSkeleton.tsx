

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Summary header skeleton */}
            <div className="flex items-center gap-3">
                <div className="h-6 w-24 bg-gray-200 rounded-lg" />
                <div className="h-8 w-32 bg-gray-200 rounded-full" />
                <div className="h-8 w-28 bg-gray-200 rounded-full" />
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                            <div className="w-8 h-8 bg-gray-200 rounded-xl" />
                        </div>
                        <div className="h-8 w-32 bg-gray-200 rounded-lg mb-2" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                ))}
            </div>

            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-[200px] h-[200px] bg-gray-100 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                            <div className="h-3 w-full bg-gray-100 rounded" />
                            <div className="h-3 w-3/4 bg-gray-100 rounded" />
                            <div className="h-3 w-1/2 bg-gray-100 rounded" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                    <div className="h-[200px] bg-gray-50 rounded-xl" />
                </div>
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-10 bg-black/10 rounded-xl mb-2" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                        <div className="h-3 w-16 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-100 rounded" />
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
