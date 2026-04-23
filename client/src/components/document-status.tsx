import { useQuery } from '@tanstack/react-query';
import { getDocumentJobsAction } from '@/data/orders';
import { AlertCircle, Loader, Download } from 'lucide-react';
import Button from './button/button';

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
            <div className="p-4 bg-gray-50 rounded-lg border border-(--border)">
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
                <div key={job.id} className="">
                    {job.status === 'pending' && (
                        <>
                            <Button className='text-amber-400' disabled={true} size="sm" variant="ghost">
                                <Loader className="animate-spin size-4" />
                                Pending
                            </Button>
                        </>
                    )}
                    {job.status === 'processing' && (
                        <>
                            <Button className='text-amber-400' disabled={true} size="sm" variant="ghost">
                                <Loader className="animate-spin size-4" />
                                Processing
                            </Button>
                        </>
                    )}
                    {job.status === 'completed' && (
                        <>
                            <Button className='' disabled={false} size="sm" variant="ghost">
                                <Download className="size-4" />
                                {formatJobType(job.type)}
                            </Button>
                        </>
                    )}
                    {job.status === 'failed' && (
                        <>
                            <Button className='text-red-400' disabled={false} size="sm" variant="ghost">
                                <AlertCircle className="size-4" />
                                {formatJobType(job.type)}
                            </Button>
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
