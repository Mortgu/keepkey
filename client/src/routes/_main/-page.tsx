import { Button, PageWidth, SearchBar } from "@/components";
import { Plus, RotateCcw, Settings } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
    const [query, setQuery] = useState("");

    return (
        <PageWidth variant="none">
            <div className="w-full border-b border-(--border) p-4">
                <SearchBar value={query} onChange={setQuery} placeholder="Suchen..." />
            </div>

            <div className="grid grid-cols-3 border-b border-(--border)">
                {/* NextCloud */}
                <div className="grid border-r border-(--border)">
                    <div className="w-full flex items-start justify-between  p-4">
                        <div className="w-fit flex items-center justify-center gap-2">
                            <div className="grid">
                                <p className="text-lg">NextCloud</p>
                                <p className="text-md font-light text-green-800">
                                    Connected
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="xs" icon={<RotateCcw size={14} />} iconOnly></Button>
                            <Button variant="secondary" size="xs" icon={<Settings size={14} />} iconOnly></Button>
                        </div>
                    </div>
                    <div className="w-full flex items-center  gap-4 border-t border-(--border) px-4 py-2 font-light">
                        <p className="grid text-sm text-gray-500"><span className="text-gray-400">url:</span> http://localhost:8080</p>
                    </div>
                </div>

                {/* Redis */}
                <div className="grid border-r border-(--border)">
                    <div className="w-full flex items-start justify-between  p-4">
                        <div className="w-fit flex items-center justify-center gap-2">
                            <div className="grid">
                                <p className="text-lg">Redis</p>
                                <p className="text-md font-light text-green-800">
                                    Connected
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="xs" icon={<RotateCcw size={14} />} iconOnly></Button>
                            <Button variant="secondary" size="xs" icon={<Settings size={14} />} iconOnly></Button>
                        </div>
                    </div>
                    <div className="w-full flex items-center  gap-4 border-t border-(--border) px-4 py-2 font-light">
                        <p className="grid text-sm text-gray-500"><span className="text-gray-400">url:</span> http://localhost:8080</p>
                    </div>
                </div>

                {/* Storage */}
                <div className="grid border-r border-(--border)">
                    <div className="w-full flex items-start justify-between  p-4">
                        <div className="w-fit flex items-center justify-center gap-2">
                            <div className="grid">
                                <p className="text-lg">S3 Storage</p>
                                <p className="text-md font-light text-green-800">
                                    Connected
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="xs" icon={<RotateCcw size={14} />} iconOnly></Button>
                            <Button variant="secondary" size="xs" icon={<Settings size={14} />} iconOnly></Button>
                        </div>
                    </div>
                    <div className="w-full flex items-center gap-4 border-t border-(--border) px-4 py-2 font-light">
                        <p className="grid flex-1 min-w-fit text-sm text-gray-500"><span className="text-gray-400">endpoint:</span> http://localhost:8080</p>
                        <p className="grid flex-1 min-w-fit text-sm text-gray-500"><span className="text-gray-400">bucket:</span> keepit-dev</p>
                        <p className="grid flex-1 min-w-fit text-sm text-gray-500"><span className="text-gray-400">capacity:</span> 2.0 T</p>
                        <p className="grid flex-1 min-w-fit text-sm text-gray-500"><span className="text-gray-400">usage:</span> 6.0 MB</p>
                    </div>
                </div>
            </div>

            <div className="grid">
                <div className="m-4 flex flex-wrap items-center gap-4">
                    <Button size="md">Button md</Button>
                    <Button size="md" icon={<Plus size={18} />}>Button md</Button>
                    <Button size="md" icon={<Plus size={18} />} iconOnly />
                    <Button size="md" variant="primary" loading>Button xs</Button>

                    <Button size="md" variant="secondary">Button md</Button>
                    <Button size="md" variant="border">Button md</Button>
                    <Button size="md" variant="ghost">Button md</Button>

                    <Button size="md" variant="primary" danger>Button xs</Button>
                    <Button size="md" variant="secondary" danger>Button xs</Button>
                    <Button size="md" variant="border" danger>Button xs</Button>
                </div>

                <div className="m-4 flex flex-wrap items-center gap-4">
                    <Button size="sm">Button sm</Button>
                    <Button size="sm" icon={<Plus size={16} />}>Button sm</Button>
                    <Button size="sm" icon={<Plus size={16} />} iconOnly />
                    <Button size="sm" variant="primary" loading>Button xs</Button>

                    <Button size="sm" variant="secondary">Button sm</Button>
                    <Button size="sm" variant="border">Button sm</Button>
                    <Button size="sm" variant="ghost">Button sm</Button>

                    <Button size="sm" variant="primary" danger>Button xs</Button>
                    <Button size="sm" variant="secondary" danger>Button xs</Button>
                    <Button size="sm" variant="border" danger>Button xs</Button>

                </div>

                <div className="m-4 flex flex-wrap items-center gap-4">
                    <Button size="xs">Button xs</Button>
                    <Button size="xs" icon={<Plus size={14} />}>Button xs</Button>
                    <Button size="xs" icon={<Plus size={14} />} iconOnly />
                    <Button size="xs" variant="primary" loading>Button xs</Button>

                    <Button size="xs" variant="secondary">Button xs</Button>
                    <Button size="xs" variant="border">Button xs</Button>
                    <Button size="xs" variant="ghost">Button xs</Button>

                    <Button size="xs" variant="primary" danger>Button xs</Button>
                    <Button size="xs" variant="secondary" danger>Button xs</Button>
                    <Button size="xs" variant="border" danger>Button xs</Button>


                </div>
            </div>
        </PageWidth>
    );
}
