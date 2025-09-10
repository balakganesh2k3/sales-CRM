'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadForm from '@/components/leads/LeadForm';
import ConvertLeadDialog from '@/components/leads/ConvertLeadDialog';
import { apiService, type Lead } from '@/lib/api';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const user = authService.getUser();
  const isManager = user?.role === 'manager';

  const fetchLeads = async () => {
    try {
      const data = await apiService.getLeads();
      setLeads(data);
      setFilteredLeads(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const filtered = leads.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeads(filtered);
  }, [searchTerm, leads]);

  const handleCreateLead = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (leadData: Omit<Lead, 'id' | 'assignedTo' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    try {
      if (editingLead) {
        const updatedLead = await apiService.updateLead(editingLead.id, leadData);
        setLeads(prev => prev.map(lead => lead.id === editingLead.id ? updatedLead : lead));
        toast({
          title: 'Success',
          description: 'Lead updated successfully',
        });
      } else {
        const newLead = await apiService.createLead(leadData);
        setLeads(prev => [newLead, ...prev]);
        toast({
          title: 'Success',
          description: 'Lead created successfully',
        });
      }
      setIsFormOpen(false);
      setEditingLead(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await apiService.deleteLead(leadId);
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    }
  };

  const handleConvertLead = (lead: Lead) => {
    setConvertingLead(lead);
    setIsConvertDialogOpen(true);
  };

  const handleConvertSubmit = async (opportunityData: { opportunityName: string; value: number; expectedCloseDate: string }) => {
    if (!convertingLead) return;

    setIsSubmitting(true);
    try {
      await apiService.convertLead(convertingLead.id, opportunityData);
      
      // Update lead status to qualified
      setLeads(prev => prev.map(lead => 
        lead.id === convertingLead.id 
          ? { ...lead, status: 'qualified' as const }
          : lead
      ));
      
      setIsConvertDialogOpen(false);
      setConvertingLead(null);
      
      toast({
        title: 'Success',
        description: 'Lead converted to opportunity successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to convert lead',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['rep', 'manager']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isManager ? 'All Leads' : 'My Leads'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isManager 
                    ? 'Monitor and manage all team leads' 
                    : 'Manage your sales leads and convert them to opportunities'
                  }
                </p>
              </div>
              {!isManager && (
                <Button onClick={handleCreateLead} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Lead</span>
                </Button>
              )}
            </div>

            <div className="mt-6 flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <LeadsTable
                leads={filteredLeads}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                onConvert={handleConvertLead}
                isManager={isManager}
              />
            </div>
          )}
        </div>

        {!isManager && (
          <LeadForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingLead(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={editingLead}
            isLoading={isSubmitting}
          />
        )}

        {!isManager && (
          <ConvertLeadDialog
            isOpen={isConvertDialogOpen}
            onClose={() => {
              setIsConvertDialogOpen(false);
              setConvertingLead(null);
            }}
            onConvert={handleConvertSubmit}
            lead={convertingLead}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default LeadsPage;