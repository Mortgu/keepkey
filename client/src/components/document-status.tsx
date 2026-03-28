import { useQuery } from '@tanstack/react-query';
import { getDocumentJobsAction } from '@/data/orders';
import { CheckCircle2, Clock, AlertCircle, Loader } from 'lucide-react';

interface DocumentStatusProps {
    orderId: string;
}

export default function DocumentStatus({ orderId }: DocumentStatusProps) {
    const { data: jobs, isPending, error } = useQuery({
        queryKey: ['document-jobs', orderId],
        queryFn: () => getDocumentJobsAction(orderId),
        refetchInterval: (data) => {
            if (!Array.isArray(data) || data.length === 0) return 3000;
            const allDone = data.every(j => j.status === 'completed' || j.status === 'failed');
            return allDone ? false : 3000;
        },
    });

    if (isPending) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Laden...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">Fehler beim Laden der Dokumente</p>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return null;
    }

    return (
        <div className="flex gap-2 h-full">
            {jobs.map((job) => (
                <div key={job.id} className="bg-gray-100 flex items-center h-fit gap-3 px-3 py-2 rounded">
                    {job.status === 'pending' && (
                        <>
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-700 flex-1">
                                {formatJobType(job.type)}: ausstehend
                            </span>
                        </>
                    )}
                    {job.status === 'processing' && (
                        <>
                            <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                            <span className="text-sm text-gray-700 flex-1">
                                {formatJobType(job.type)}: wird generiert...
                            </span>
                        </>
                    )}
                    {job.status === 'completed' && (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700 flex-1">
                                {formatJobType(job.type)}: abgeschlossen
                            </span>
                        </>
                    )}
                    {job.status === 'failed' && (
                        <>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <div className="flex-1">
                                <span className="text-sm text-gray-700">
                                    {formatJobType(job.type)}: fehlgeschlagen
                                </span>
                                {job.error && (
                                    <p className="text-xs text-red-600 mt-1">{job.error}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

function formatJobType(type: string): string {
    const typeMap: Record<string, string> = {
        invoice: 'Rechnung',
        license: 'Lizenz',
        contract: 'Vertrag',
    };
    return typeMap[type] || type;
}
