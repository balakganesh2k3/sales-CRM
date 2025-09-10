'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Opportunity } from '@/lib/api';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunityId: string) => void;
  isManager?: boolean;
}

const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  opportunities,
  onEdit,
  onDelete,
  isManager = false,
}) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'discovery':
        return 'bg-blue-100 text-blue-800';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    if (probability >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No opportunities found. Create your first opportunity to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opportunity) => (
            <TableRow key={opportunity.id}>
              <TableCell className="font-medium">{opportunity.name}</TableCell>
              <TableCell>{opportunity.company}</TableCell>
              <TableCell className="font-medium">
                ${opportunity.value.toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge className={getStageColor(opportunity.stage)}>
                  {opportunity.stage}
                </Badge>
              </TableCell>
              <TableCell className={`font-medium ${getProbabilityColor(opportunity.probability)}`}>
                {opportunity.probability}%
              </TableCell>
              <TableCell>
                {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(opportunity.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!isManager && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(opportunity.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OpportunitiesTable;