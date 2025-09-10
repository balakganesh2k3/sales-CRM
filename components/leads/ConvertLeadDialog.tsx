'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type Lead } from '@/lib/api';

interface ConvertLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (opportunityData: { opportunityName: string; value: number; expectedCloseDate: string }) => void;
  lead: Lead | null;
  isLoading?: boolean;
}

const ConvertLeadDialog: React.FC<ConvertLeadDialogProps> = ({
  isOpen,
  onClose,
  onConvert,
  lead,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    opportunityName: '',
    value: '',
    expectedCloseDate: '',
  });

  React.useEffect(() => {
    if (lead) {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      
      setFormData({
        opportunityName: `${lead.company} - Sales Opportunity`,
        value: '',
        expectedCloseDate: defaultDate.toISOString().split('T')[0],
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConvert({
      opportunityName: formData.opportunityName,
      value: parseFloat(formData.value) || 0,
      expectedCloseDate: formData.expectedCloseDate,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert Lead to Opportunity</DialogTitle>
          <DialogDescription>
            Convert "{lead?.name}" from {lead?.company} into a sales opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="opportunityName">Opportunity Name</Label>
              <Input
                id="opportunityName"
                value={formData.opportunityName}
                onChange={(e) => handleChange('opportunityName', e.target.value)}
                placeholder="Enter opportunity name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="value">Estimated Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Enter estimated value"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Converting...' : 'Convert to Opportunity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadDialog;