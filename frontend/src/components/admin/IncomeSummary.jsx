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
      // Extract date and format it
      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString('default', {
        month: 'short',
        day: 'numeric'
      });
      acc[formattedDate] = entry.total_income || 0;
      return acc;
    }, {});
  
    const membershipIncome = membershipData.reduce((acc, entry) => {
      // Extract date and format it
      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString('default', {
        month: 'short',
        day: 'numeric'
      });
      acc[formattedDate] = entry.total_income || 0;
      return acc;
    }, {});
  
    const labels = [...new Set([...Object.keys(walkInIncome), ...Object.keys(membershipIncome)])].sort((a, b) => {
      // Custom sorting to handle date strings
      const parseDate = (dateStr) => {
        const [month, day] = dateStr.split(' ');
        const monthMap = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        return new Date(new Date().getFullYear(), monthMap[month], parseInt(day));
      };
      return parseDate(a) - parseDate(b);
    });
  
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
          const monthData = walkInData.find(entry => {
            // If recent_payment_date exists, extract month
            if (entry.recent_payment_date) {
              const date = new Date(entry.recent_payment_date);
              return date.getMonth() === index;
            }
            return false;
          });
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
    scales: {
      x: {
        ticks: {
          callback: function(value) {
            // Directly return the month name from the labels
            return this.getLabelForValue(value);
          }
        }
      },
      y: {
        title: {
          display: false
        }
      }
    },
   plugins: {
      tooltip: {
        callbacks: {
          title: function(context) {
            // Ensure only month name is shown
            return context[0].label;
          },
          label: function(context) {
            return `₱${Number(context.parsed.y).toLocaleString()}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'top'
      }
    }
  }}
/>
      
      </div>
      <div className="income-summary-stats">
  <div className="total-income">
    <h3>Total Income</h3>
    <p>Walk-in: ₱{Number(incomeData.datasets[0].data.reduce((a, b) => a + b, 0)).toLocaleString()}</p>
    <p>Membership: ₱{Number(incomeData.datasets[1].data.reduce((a, b) => a + b, 0)).toLocaleString()}</p>
  </div>
</div>
    </div>
  );
}

export default IncomeSummary;