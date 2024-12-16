import { useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useIncomeSummary } from '../../hooks/useIncomeSummary';
import IncomeChart from './IncomeChart';
import IncomeSummaryStats from './IncomeSummaryStats';
import { Spinner, ErrorMessage } from './StatusComponents';
import '../../css/admin/IncomeSummary.css';

Chart.register(...registerables);

function IncomeSummary() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const { walkInData, membershipData, isLoading, error } = useIncomeSummary(
    selectedYear, 
    selectedPeriod
  );

  // Early returns for different states
  if (isLoading) return <Spinner message="Loading income data..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!walkInData.length && !membershipData.length) return <ErrorMessage message="No income data available" />;

  return (
    <div className="income-summary-container">
      <div className="income-summary-header">
        <h1>Income Summary</h1>
        <div className="filters">
          <div className="year-selector">
            <label htmlFor="year-select">Select Year: </label>
            <select 
              id="year-select"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="period-selector">
            <label htmlFor="period-select">Select Period: </label>
            <select 
              id="period-select"
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <IncomeChart 
          walkInData={walkInData}
          membershipData={membershipData}
          selectedYear={selectedYear}
          selectedPeriod={selectedPeriod}
        />
      </div>

      <IncomeSummaryStats 
        walkInData={walkInData}
        membershipData={membershipData}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}

export default IncomeSummary;