import { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../../css/admin/IncomeSummary.css';

Chart.register(...registerables);

function IncomeSummary() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [availableYears, setAvailableYears] = useState([]);
  const [incomeData, setIncomeData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Walk-in Income',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Membership Income',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  });

  // Separate methods for fetching years and income data
  const fetchAvailableYears = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/getAvailableYears');
      const data = await response.json();
      
      const sortedYears = data.years.sort((a, b) => b - a);
      
      setAvailableYears(sortedYears);
      
      if (!sortedYears.includes(selectedYear)) {
        setSelectedYear(sortedYears[0] || new Date().getFullYear());
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
      setAvailableYears([new Date().getFullYear()]);
    }
  }, []);

  const fetchIncomeData = useCallback(async () => {
    try {
      const walkInResponse = await fetch(`http://localhost:3000/getWalkInCustomerRecords?year=${selectedYear}&period=${selectedPeriod}`);
      const walkInData = await walkInResponse.json();

      const membershipResponse = await fetch(`http://localhost:3000/getMemberCustomerRecords?year=${selectedYear}&period=${selectedPeriod}`);
      const membershipData = await membershipResponse.json();

      const chartData = prepareChartData(walkInData, membershipData);
      setIncomeData(chartData);
    } catch (error) {
      console.error('Error fetching income data:', error);
      resetIncomeData();
    }
  }, [selectedYear, selectedPeriod]); 

  // Prepare chart data based on selected period
  const prepareChartData = useCallback((walkInData, membershipData) => {
    const periodMap = {
      daily: prepareDailyData,
      monthly: prepareMonthlyData
    };
  
    return periodMap[selectedPeriod](walkInData, membershipData);
  }, [selectedPeriod]); 

  // Helper method to prepare daily data
const prepareDailyData = (walkInData, membershipData) => {
  const walkInIncome = walkInData.reduce((acc, entry) => {
    acc[entry.date] = entry.total_income || 0;
    return acc;
  }, {});

  const membershipIncome = membershipData.reduce((acc, entry) => {
    acc[entry.date] = entry.total_income || 0;
    return acc;
  }, {});

  const labels = [...new Set([...Object.keys(walkInIncome), ...Object.keys(membershipIncome)])].sort();

  return {
    labels,
    datasets: [
      {
        label: 'Walk-in Income',
        data: labels.map(date => walkInIncome[date] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Membership Income',
        data: labels.map(date => membershipIncome[date] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
};

// Helper method to prepare weekly data

// Helper method to prepare monthly data
// Modify the prepareMonthlyData method
const prepareMonthlyData = (walkInData, membershipData) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    labels: months,
    datasets: [
      {
        label: 'Walk-in Income',
        data: months.map((_, index) => {
          const monthData = walkInData.find(entry => 
            new Date(entry.recent_payment_date).getMonth() === index
          );
          return monthData ? monthData.total_income : 0;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Membership Income',
        data: months.map((_, index) => {
          const monthData = membershipData.find(entry => 
            // Use month_name if available, otherwise use index
            (entry.month_name && months[index] === entry.month_name) || 
            (entry.month && entry.month === index + 1)
          );
          return monthData ? monthData.total_income : 0;
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
};

// Reset income data method
useEffect(() => {
  fetchAvailableYears();
}, [fetchAvailableYears]); // Add fetchAvailableYears to dependency array

// Second useEffect for fetching income data
useEffect(() => {
  fetchIncomeData();
}, [fetchIncomeData]); // Add fetchIncomeData to dependency array

// Reset income data method
const resetIncomeData = useCallback(() => {
  setIncomeData(prevState => ({
    ...prevState,
    labels: [],
    datasets: [
      { ...prevState.datasets[0], data: [] },
      { ...prevState.datasets[1], data: [] }
    ]
  }));
}, []);

return (
  <div className="income-summary">
    <div className="income-summary-header">
      <h1>Income Summary</h1>
      <div className="income-controls">
        <div className="year-selector">
          <label>Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="period-selector">
          <label>View By:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
      <div className="income-chart-container">
        <Bar
          data={incomeData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            // ... (previous chart options)
          }}
        />
      </div>
      <div className="income-summary-stats">
        <div className="total-income">
          <h3>Total Income</h3>
          <p>Walk-in: ₱{incomeData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}</p>
          <p>Membership: ₱{incomeData.datasets[1].data.reduce((a, b) => a + b, 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default IncomeSummary;