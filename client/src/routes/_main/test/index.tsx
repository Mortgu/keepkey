import { Button, Input } from '@/components';
import { createFileRoute } from '@tanstack/react-router';
import { AreaChart, BarChart, Area, CartesianGrid, Tooltip, Bar, createHorizontalChart, XAxis, YAxis } from 'recharts';
import { generateMockData, type MockDataType } from '@recharts/devtools';
import { RotateCcw } from 'lucide-react';

export const Route = createFileRoute('/_main/test/')({
    component: RouteComponent,
});

const Typed = createHorizontalChart<MockDataType, string, number>()({
    BarChart,
    Bar,
    YAxis,
    XAxis,
    Tooltip,
});

function RouteComponent() {

    const dataArea = generateMockData(6, 598905);

    const data = [
        { name: '28.08.26', value: 12 },
        { name: '29.08.26', value: 25 },
        { name: '30.08.26', value: 19 },
        { name: '30.08.26', value: 33 },
    ];

    return (
        <div>

            {/* Header */}
            <div className='flex items-center justify-between mx-4 border-b border-(--border) h-16'>


                <div className='flex-2 flex items-center gap-2'>
                    <Input size="sm" placeholder='Quick search...' />
                </div>
            </div>

            <div className='m-4'>

                <div className='flex items-center justify-between mb-6'>
                    <div className='grid gap-1'>
                        <h1 className='text-xl font-medium'>Overview</h1>
                        <p className='text-sm text-gray-500'>Here's your performance summary</p>
                    </div>

                    <Button size="sm">
                        Erstellen
                    </Button>
                </div>

                <div className='flex items-start gap-4 mb-4'>


                    <div className='flex-1 grid rounded-lg bg-(--page-bg) border border-t-3 border-(--border) border-t-(--primary-400)'>
                        <div className='flex items-center justify-between px-4 py-3'>
                            <p className='text-lg font-medium'>NextCloud</p>
                            <div className='flex items-center gap-4'>
                                <p className='text-sm text-(--primary)'>Verbunden</p>
                                <Button
                                    size="xs"
                                    variant="border"
                                    icon={<RotateCcw />}
                                    iconOnly
                                />
                            </div>
                        </div>
                        <div className='flex items-center gap-4 bg-white px-4 py-2 rounded-lg border-t border-(--border)'>
                            <p>
                                <span className=''>url:</span>
                                http://localhost:3000/
                            </p>
                        </div>
                    </div>


                    <div className='flex-1 grid rounded-lg bg-(--page-bg) border border-t-3 border-(--border) border-t-(--destructive)'>
                        <div className='flex items-center justify-between px-4 py-3'>
                            <p className='text-lg font-medium'>Redis</p>
                            <p className='text-sm text-(--destructive)'>Fehlgeschlagen</p>
                        </div>
                    </div>

                    <div className='flex-1 grid rounded-lg bg-(--page-bg) border border-t-3 border-(--border) border-t-(--primary-400)'>
                        <div className='flex items-center justify-between px-4 py-3'>
                            <p className='text-lg font-medium'>S3 Storage</p>
                            <p className='text-sm text-(--primary)'>Verbunden</p>
                        </div>
                        <div className='flex items-center gap-4 bg-white px-4 py-2 rounded-lg border-t border-(--border)'>
                            <p>
                                <span className=''>endpoint:</span>
                                http://localhost:3900/
                            </p>
                            <p>
                                <span className=''>bucket:</span>
                                keepit-dev
                            </p>
                        </div>
                    </div>

                </div>

                <div className='flex flex-wrap w-full gap-4'>

                    <div className='flex-1 flex flex-col w-fit h-fit border border-(--border) bg-(--page-bg) rounded-xl min-w-[500px] overflow-hidden'>
                        <div className='grid gap-0.5 px-4 py-3'>
                            <h1 className='text-md'>Angebots Volumen</h1>
                            <p className='text-sm text-gray-500'>Wachstumsraten der erstelten Angebote.</p>
                        </div>
                        <div className="relative w-full h-fit border-t border-(--border) bg-white rounded-xl overflow-hidden">   {/* Höhe ans Parent */}
                            <div className='top-0 p-6'>
                                <h1 className='text-lg font-semibold'>Overall sentiment score</h1>
                            </div>
                            <AreaChart
                                className='w-full max-h-full h-45'
                                responsive
                                data={dataArea}
                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={true} horizontal={false} strokeDasharray="3 3" stroke="#e5e7eb" />

                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="20%" stopColor="#3d9e74" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip />
                                <Area
                                    type="natural"
                                    dataKey="x"
                                    stroke="#3d9e74"
                                    strokeWidth={3}
                                    activeDot={{ stroke: '#' }}
                                    fillOpacity={1}
                                    fill="url(#colorUv)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                            <div className='flex flex-col px-6 py-4 h-full w-full bg-gradient-to-t from-[#ffffff] to-[rgba(255,255,255,0)]'>
                                <h1 className='text-[56px] font-medium'>24%</h1>
                                <h1 className='text-md font-normal text-gray-500'>An overview of customer sentiment-positive, neutral or negative</h1>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1 flex flex-col w-fit h-fit border-t border-(--border) bg-(--page-bg) rounded-xl min-w-[500px] overflow-hidden'>
                        <div className='grid gap-0.5 px-4 py-3'>
                            <h1 className='text-md'>Angebots Volumen</h1>
                            <p className='text-sm text-gray-500'>Wachstumsraten der erstelten Angebote.</p>
                        </div>
                        <div className="relative w-full h-fit border border-(--border) bg-white rounded-xl overflow-hidden">   {/* Höhe ans Parent */}
                            <div className='top-0 p-6'>
                                <h1 className='text-lg font-semibold'>Overall sentiment score</h1>
                            </div>
                            <Typed.BarChart
                                className='w-full max-h-full h-45'
                                responsive
                                data={dataArea}
                                margin={{ top: 0, right: 25, left: 25, bottom: 0 }}>
                                <CartesianGrid vertical={false} horizontal={true} strokeDasharray="3 3" stroke="#e5e7eb" />
                                <Typed.Tooltip />
                                <Typed.Bar dataKey="x" stackId="a" background fill="#002e1c" />
                                <Typed.Bar dataKey="y" stackId="a" background fill="#3d9e74" />
                            </Typed.BarChart>
                            <div className='flex flex-col px-6 py-4 h-full w-full bg-gradient-to-t from-[#ffffff] to-[rgba(255,255,255,0)]'>
                                <h1 className='text-[56px] font-medium'>24%</h1>
                                <h1 className='text-md font-normal text-gray-500'>An overview of customer sentiment-positive, neutral or negative</h1>
                            </div>
                        </div>
                    </div>


                </div>

            </div>



        </div>
    );
}
