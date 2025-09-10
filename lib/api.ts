import { authService } from './auth';

const API_BASE_URL = 'http://localhost:3001/api';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

interface Opportunity {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  leadId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  userName: string;
  totalLeads: number;
  openOpportunities: number;
  totalOpportunityValue: number;
  totalRevenue: number;
  leadsByStatus: Record<string, number>;
  opportunitiesByStage: Record<string, number>;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: authService.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Leads API
  async getLeads(): Promise<Lead[]> {
    return this.request<Lead[]>('/leads');
  }

  async createLead(lead: Omit<Lead, 'id' | 'assignedTo' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    });
  }

  async deleteLead(id: string): Promise<void> {
    await this.request(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  async convertLead(id: string, opportunityData: { opportunityName?: string; value?: number; expectedCloseDate?: string }): Promise<Opportunity> {
    return this.request<Opportunity>(`/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(opportunityData),
    });
  }

  // Opportunities API
  async getOpportunities(): Promise<Opportunity[]> {
    return this.request<Opportunity[]>('/opportunities');
  }

  async createOpportunity(opportunity: Omit<Opportunity, 'id' | 'assignedTo' | 'leadId' | 'createdAt' | 'updatedAt'>): Promise<Opportunity> {
    return this.request<Opportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    });
  }

  async updateOpportunity(id: string, opportunity: Partial<Opportunity>): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opportunity),
    });
  }

  async deleteOpportunity(id: string): Promise<void> {
    await this.request(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }
}

export const apiService = new ApiService();
export type { Lead, Opportunity, DashboardStats };