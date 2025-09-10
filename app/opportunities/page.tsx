'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import OpportunitiesTable from '@/components/opportunities/OpportunitiesTable';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import { apiService, type Opportunity } from '@/lib/api';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const user = authService.getUser();
  const isManager = user?.role === 'manager';

  const fetchOpportunities = async () => {
    try {
      const data = await apiService.getOpportunities();
      setOpportunities(data);
      setFilteredOpportunities(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch opportunities',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    const filtered = opportunities.filter(opp =>
      opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOpportunities(filtered);
  }, [searchTerm, opportunities]);

  const handleCreateOpportunity = () => {
    setEditingOpportunity(null);
    setIsFormOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (opportunityData: Omit<Opportunity, 'id' | 'assignedTo' | 'leadId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    try {
      if (editingOpportunity) {
        const updatedOpportunity = await apiService.updateOpportunity(editingOpportunity.id, opportunityData);
        setOpportunities(prev => prev.map(opp => opp.id === editingOpportunity.id ? updatedOpportunity : opp));
        toast({
          title: 'Success',
          description: 'Opportunity updated successfully',
        });
      } else {
        const newOpportunity = await apiService.createOpportunity(opportunityData);
        setOpportunities(prev => [newOpportunity, ...prev]);
        toast({
          title: 'Success',
          description: 'Opportunity created successfully',
        });
      }
      setIsFormOpen(false);
      setEditingOpportunity(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save opportunity',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      await apiService.deleteOpportunity(opportunityId);
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      toast({
        title: 'Success',
        description: 'Opportunity deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete opportunity',
        variant: 'destructive',
      });
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
                  {isManager ? 'All Opportunities' : 'My Opportunities'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isManager 
                    ? 'Monitor and manage all team opportunities' 
                    : 'Track and manage your sales opportunities'
                  }
                </p>
              </div>
              {!isManager && (
                <Button onClick={handleCreateOpportunity} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Opportunity</span>
                </Button>
              )}
            </div>

            <div className="mt-6 flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search opportunities..."
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
              <OpportunitiesTable
                opportunities={filteredOpportunities}
                onEdit={handleEditOpportunity}
                onDelete={handleDeleteOpportunity}
                isManager={isManager}
              />
            </div>
          )}
        </div>

        {!isManager && (
          <OpportunityForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingOpportunity(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={editingOpportunity}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default OpportunitiesPage;