'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiService, type DashboardStats } from '@/lib/api';
import { 
  Users, Target, DollarSign, TrendingUp, 
  ArrowUpRight, ArrowDownRight, BarChart3, 
  LineChart, Activity 
} from 'lucide-react';

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const mainStats = [
    {
      title: 'Total Leads',
      value: stats?.totalLeads || 0,
      icon: Users,
      trend: 12,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      title: 'Opportunities',
      value: stats?.openOpportunities || 0,
      icon: Target,
      trend: -5,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    },
    {
      title: 'Pipeline Value',
      value: `$${(stats?.totalOpportunityValue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: 8,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    },
    {
      title: 'Avg Deal Size',
      value: `$${(stats?.totalRevenue ? stats.totalRevenue / (stats?.totalLeads || 1) : 0).toLocaleString()}`,
      icon: TrendingUp,
      trend: 15,
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-violet-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/50">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {stats?.userName || 'Sales Rep'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's your sales performance overview for the last 30 days
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mainStats.map((stat, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <CardContent className={`p-6 ${stat.bgColor}`}>
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex items-center space-x-1">
                      {stat.trend > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={stat.trend > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {Math.abs(stat.trend)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900">
                      {stat.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Leads by Status</h3>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                    Total: {stats?.totalLeads || 0}
                  </span>
                </div>
                <div className="space-y-4">
                  {Object.entries(stats?.leadsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'new' ? 'bg-blue-500' :
                          status === 'contacted' ? 'bg-amber-500' :
                          status === 'qualified' ? 'bg-emerald-500' : 
                          'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="capitalize text-gray-700">{status}</span>
                            <span className="font-semibold text-gray-900">{count}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                status === 'new' ? 'bg-blue-500' :
                                status === 'contacted' ? 'bg-amber-500' :
                                status === 'qualified' ? 'bg-emerald-500' : 
                                'bg-red-500'
                              }`}
                              style={{ 
                                width: `${(count / (stats?.totalLeads || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pipeline Stages
                    </h3>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-full">
                    Total: {stats?.openOpportunities || 0}
                  </span>
                </div>
                <div className="space-y-4">
                  {Object.entries(stats?.opportunitiesByStage || {}).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${
                          stage === 'discovery' ? 'bg-violet-500' :
                          stage === 'proposal' ? 'bg-indigo-500' :
                          stage === 'negotiation' ? 'bg-fuchsia-500' : 
                          'bg-emerald-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="capitalize text-gray-700">{stage}</span>
                            <span className="font-semibold text-gray-900">{count}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                stage === 'discovery' ? 'bg-violet-500' :
                                stage === 'proposal' ? 'bg-indigo-500' :
                                stage === 'negotiation' ? 'bg-fuchsia-500' : 
                                'bg-emerald-500'
                              }`}
                              style={{ 
                                width: `${(count / (stats?.openOpportunities || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;