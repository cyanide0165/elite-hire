'use client';

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getFilteredRowModel,
    ColumnDef
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface Candidate {
    id: string;
    name: string;
    headline: string | null;
    skills: string | null; // CSV from DB
    experienceSummary: string | null;
    profileUrl: string | null;
    lastSynced: string | Date | null;
}

interface CandidateTableProps {
    data: Candidate[];
}

export function CandidateTable({ data }: CandidateTableProps) {
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo<ColumnDef<Candidate>[]>(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (info) => <span className="font-semibold">{info.getValue() as string}</span>,
            },
            {
                header: 'Headline',
                accessorKey: 'headline',
            },
            {
                header: 'Skills',
                accessorKey: 'skills',
                cell: (info) => (info.getValue() as string)?.split(',').map((s) => (
                    <span key={s} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {s.trim()}
                    </span>
                )),
            },
            {
                header: 'Profile',
                accessorKey: 'profileUrl',
                cell: (info) => {
                    const url = info.getValue() as string;
                    return url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View
                        </a>
                    ) : 'N/A';
                }
            },
            {
                header: 'Last Synced',
                accessorKey: 'lastSynced',
                cell: (info) => {
                    const date = info.getValue() as string | Date;
                    return date ? new Date(date).toLocaleDateString() : '-';
                }
            }
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    const downloadCSV = () => {
        const headers = ['Name', 'Headline', 'Skills', 'Profile URL', 'Last Synced'];
        const rows = data.map(c => [
            c.name,
            c.headline || '',
            c.skills || '',
            c.profileUrl || '',
            c.lastSynced ? new Date(c.lastSynced).toISOString() : ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "candidates.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <input
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search all columns..."
                    className="p-2 border rounded w-64 dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                    onClick={downloadCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Export CSV
                </button>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {table.getRowModel().rows.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No candidates found.</div>
                )}
            </div>
        </div>
    );
}
