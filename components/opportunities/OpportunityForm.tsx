'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type Opportunity } from '@/lib/api';

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opportunityData: Omit<Opportunity, 'id' | 'assignedTo' | 'leadId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Opportunity | null;
  isLoading?: boolean;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    value: '',
    stage: 'discovery' as Opportunity['stage'],
    probability: '25',
    expectedCloseDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        company: initialData.company,
        value: initialData.value.toString(),
        stage: initialData.stage,
        probability: initialData.probability.toString(),
        expectedCloseDate: initialData.expectedCloseDate,
      });
    } else {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      
      setFormData({
        name: '',
        company: '',
        value: '',
        stage: 'discovery',
        probability: '25',
        expectedCloseDate: defaultDate.toISOString().split('T')[0],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      company: formData.company,
      value: parseFloat(formData.value) || 0,
      stage: formData.stage,
      probability: parseInt(formData.probability) || 25,
      expectedCloseDate: formData.expectedCloseDate,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Update probability based on stage
    if (field === 'stage') {
      const probabilityMap = {
        discovery: '25',
        proposal: '50',
        negotiation: '75',
        won: '100',
        lost: '0',
      };
      setFormData(prev => ({
        ...prev,
        stage: value as Opportunity['stage'],
        probability: probabilityMap[value as keyof typeof probabilityMap] || '25',
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the opportunity information below.'
              : 'Add a new opportunity to your pipeline.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Opportunity Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter opportunity name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="value">Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Enter opportunity value"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => handleChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => handleChange('probability', e.target.value)}
                placeholder="Enter probability"
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
              {isLoading ? 'Saving...' : (initialData ? 'Update Opportunity' : 'Create Opportunity')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;