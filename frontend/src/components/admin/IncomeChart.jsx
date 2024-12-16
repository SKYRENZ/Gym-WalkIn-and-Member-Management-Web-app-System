import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { getCurrentDayLabel } from '../../utils/dateUtils';

function IncomeChart({ walkInData, membershipData, selectedYear, selectedPeriod }) {
  const chartData = useMemo(() => {
    const labels = selectedPeriod === 'daily' 
      ? [getCurrentDayLabel()] 
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      labels,
      datasets: [
        {
          label: 'Walk-in Income',
          data: selectedPeriod === 'daily' 
            ? [walkInData.reduce((sum, entry) => sum + (entry.total_income || 0), 0)]
            : walkInData.map(entry => entry.total_income || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.6)'
        },
        {
          label: 'Membership Income',
          data: selectedPeriod === 'daily'
            ? [membershipData.reduce((sum, entry) => sum + (entry.total_income || 0), 0)]
            : membershipData.map(entry => entry.total_income || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }
      ]
    };
  }, [walkInData, membershipData, selectedPeriod]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: selectedPeriod === 'daily' 
          ? `Daily Income for ${getCurrentDayLabel()} ${selectedYear}` 
          : `Income Summary for ${selectedYear}`
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'Amount (₱)' },
        beginAtZero: true
      }
    }
  }), [selectedYear, selectedPeriod]);

  return <Bar data={chartData} options={chartOptions} />;
}

IncomeChart.propTypes = {
  walkInData: PropTypes.array.isRequired,
  membershipData: PropTypes.array.isRequired,
  selectedYear: PropTypes.number.isRequired,
  selectedPeriod: PropTypes.string.isRequired
};

export default IncomeChart;