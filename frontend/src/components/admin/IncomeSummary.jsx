
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import useFetchData from '../../hooks/useFetchData';
import '../../css/admin/IncomeSummary.css';

// Register Chart.js components
Chart.register(...registerables);

// Spinner Component
const Spinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading income data...</p>
  </div>
);

// Error Message Component with PropTypes
const ErrorMessage = ({ message }) => (
  <div className="error-container">
    <h2>Error Occurred</h2>
    <p>{message}</p>
    <button onClick={() => window.location.reload()}>
      Retry Loading
    </button>
  </div>
);

// Add PropTypes validation for ErrorMessage
ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired
};

// No Data Component
const NoDataMessage = () => (
  <div className="no-data-container">
    <h3>No Income Data Available</h3>
    <p>Please select a different year or check your data sources.</p>
  </div>
);

function IncomeSummary() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Fetch available years with enhanced error handling
  const { 
    data: availableYears = { years: [] }, 
    isLoading: yearsLoading, 
    error: yearsError 
  } = useFetchData('http://localhost:3000/getAvailableYears');

  const { 
    data: walkInData = [], 
    isLoading: walkInLoading,
    error: walkInError,
    metadata: walkInMetadata = {} // Add this line to destructure metadata
  } = useFetchData(
    `http://localhost:3000/getWalkInCustomerRecords?year=${selectedYear}&period=${selectedPeriod}`,
    [selectedYear, selectedPeriod]
  );
  
  // Similarly for membership data
  const { 
    data: membershipData = [], 
    isLoading: membershipLoading,
    error: membershipError,
    metadata: membershipMetadata = {} // Add this line
  } = useFetchData(
    `http://localhost:3000/getMemberCustomerRecords?year=${selectedYear}&period=${selectedPeriod}`,
    [selectedYear, selectedPeriod]
  );
  // Comprehensive loading state
  const isAnyLoading = yearsLoading || walkInLoading || membershipLoading;
  
  // Comprehensive error state
  const anyError = yearsError || walkInError || membershipError;

  // Prepare chart data using useMemo for performance optimization
  const incomeChartData = useMemo(() => {
    // Default empty chart data
    const labels = selectedPeriod === 'monthly'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Q1', 'Q2', 'Q3', 'Q4'];
  
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Walk-in Income',
          data: new Array(labels.length).fill(0),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Membership Income',
          data: new Array(labels.length).fill(0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };

   // Safely process data
   const walkInDataArray = walkInData?.data || walkInData || [];

   if (Array.isArray(walkInDataArray) && walkInDataArray.length > 0) {
     walkInDataArray.forEach(entry => {
       const index = selectedPeriod === 'monthly' 
         ? (entry.month - 1) 
         : (Math.ceil(entry.month / 3) - 1);
       
       if (index >= 0 && index < labels.length) {
         chartData.datasets[0].data[index] = entry.total_income || 0;
       }
     });
   }
 
   return chartData;
 }, [walkInData, selectedPeriod]);
  // Render loading state
  if (isAnyLoading) {
    return <Spinner />;
  }

  // Render error state
  if (anyError) {
    return <ErrorMessage message={anyError || 'An error occurred'} />;
  }

  // Check if no data is available
  const hasNoData = 
    availableYears.years.length === 0 || 
    (walkInData.length === 0 && membershipData.length === 0);

  // Render no data state
  if (hasNoData) {
    return <NoDataMessage />;
  }

  // Render main component
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
              {availableYears.years.map(year => (
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
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="income-chart-container">
        <Bar
          data={incomeChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>

      <div className="income-summary-stats">
        <div className="total-income">
          <h3>Total Income Summary</h3>
          <div className="income-breakdown">
            <div className="walk-in-income">
              <h4>Walk-in Income</h4>
              <p>Total: ₱{walkInMetadata?.total_income?.toLocaleString() || '0'}</p>
              <p>Entries: {walkInMetadata?.total_entries || 0}</p>
            </div>
            <div className="membership-income">
              <h4>Membership Income</h4>
              <p>Total: ₱{membershipMetadata?.total_income?.toLocaleString() || '0'}</p>
              <p>Entries: {membershipMetadata?.total_entries || 0}</p>
            </div>
            <div className="combined-income">
              <h4>Combined Total</h4>
              <p>
                ₱{(
                  (walkInMetadata?.total_income || 0) + 
                  (membershipMetadata?.total_income || 0)
                ).toLocaleString()}
              </p>
              <p>
                Total Entries: {
                  (membershipMetadata?.total_entries || 0)
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add PropTypes validation for IncomeSummary
IncomeSummary.propTypes = {
  // If you expect any props, define them here
  // For now, it's an empty object since the component doesn't receive props
};

export default IncomeSummary;