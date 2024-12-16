import { useState, useMemo } from 'react';
import useFetchData from './useFetchData';

export const useMemberCounting = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Fetch available years
  const { 
    data: availableYearsData = { years: [currentYear] }, 
  } = useFetchData('http://localhost:3000/getAvailableYears', []);

  // Fetch walk-in data
  const { 
    data: walkInData = [], 
    isLoading: walkInLoading, 
    error: walkInError 
  } = useFetchData(
    `http://localhost:3000/getWalkin&MemberCounting?year=${selectedYear}&period=monthly&type=Walk In`, 
    [selectedYear]
  );

  // Fetch membership data
  const { 
    data: membershipData = [], 
    isLoading: membershipLoading, 
    error: membershipError 
  } = useFetchData(
    `http://localhost:3000/getWalkin&MemberCounting?year=${selectedYear}&period=monthly&type=Member`, 
    [selectedYear]
  );

  // Ensure years are always available
  const availableYears = useMemo(() => {
    const years = availableYearsData?.years || [currentYear];
    
    if (!years.includes(currentYear)) {
      years.push(currentYear);
    }

    return {
      years: [...new Set(years)].sort((a, b) => b - a)
    };
  }, [availableYearsData, currentYear]);

  // Prepare chart data
  const prepareChartData = useMemo(() => {
    const monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const chartData = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Walk-ins',
          data: new Array(12).fill(0),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Members',
          data: new Array(12).fill(0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };

    // Process walk-in data
    if (Array.isArray(walkInData?.data || walkInData)) {
      (walkInData.data || walkInData).forEach(entry => {
        if (entry.month && entry.total_entries) {
          chartData.datasets[0].data[entry.month - 1] = entry.total_entries;
        }
      });
    }

    // Process membership data
    if (Array.isArray(membershipData?.data || membershipData)) {
      (membershipData.data || membershipData).forEach(entry => {
        if (entry.month && entry.total_entries) {
          chartData.datasets[1].data[entry.month - 1] = entry.total_entries;
        }
      });
    }

    return chartData;
  }, [walkInData, membershipData]);

  // Calculate total walk-ins and members using metadata if available
  const totalWalkIns = useMemo(() => {
    // First, try to use metadata
    if (walkInData?.metadata?.total_entries) {
      return walkInData.metadata.total_entries;
    }

    // Fallback to manual calculation
    if (!Array.isArray(walkInData?.data || walkInData)) return 0;
    
    return (walkInData.data || walkInData).reduce((sum, entry) => 
      sum + (entry.total_entries || 0), 0);
  }, [walkInData]);

  const totalMembers = useMemo(() => {
    // First, try to use metadata
    if (membershipData?.metadata?.total_entries) {
      return membershipData.metadata.total_entries;
    }

    // Fallback to manual calculation
    if (!Array.isArray(membershipData?.data || membershipData)) return 0;
    
    return (membershipData.data || membershipData).reduce((sum, entry) => 
      sum + (entry.total_entries || 0), 0);
  }, [membershipData]);

  return {
    selectedYear,
    setSelectedYear,
    availableYears,
    membershipRawData: membershipData?.data || membershipData || [],
    walkInRawData: walkInData?.data || walkInData || [],
    membershipData: prepareChartData,
    totalWalkIns,
    totalMembers,
    isLoading: walkInLoading || membershipLoading,
    error: walkInError || membershipError
  };
};