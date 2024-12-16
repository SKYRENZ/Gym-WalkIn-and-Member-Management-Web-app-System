import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useMemberCounting } from '../../hooks/useMemberCounting';
import '../../css/admin/MemberCounting.css';

// Register all necessary components
Chart.register(...registerables);

function MemberCounting() {
  const { 
    selectedYear,
    setSelectedYear,
    availableYears,
    totalWalkIns,
    totalMembers,
    membershipData,
    isLoading,
    error
  } = useMemberCounting();

  // Defensive check to ensure years exist
  const years = availableYears?.years || [new Date().getFullYear()];

  // Render loading state
  if (isLoading) {
    return (
      <div className="member-counting">
        <div className="member-counting-header">
          <h1>Monthly Membership and Walk-in Count</h1>
          <div className="year-selector">
            <label htmlFor="year-select">Select Year: </label>
            <select 
              id="year-select"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="loading-container">
          Loading data...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="member-counting">
        <div className="member-counting-header">
          <h1>Monthly Membership and Walk-in Count</h1>
          <div className="year-selector">
            <label htmlFor="year-select">Select Year: </label>
            <select 
              id="year-select"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="error-container">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-counting">
      <div className="member-counting-header">
        <h1>Monthly Membership and Walk-in Count</h1>
        <div className="year-selector">
          <label htmlFor="year-select">Select Year: </label>
          <select 
            id="year-select"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ 
        width: '100%', 
        height: '400px',
        maxHeight: '50vh', // Limit height on smaller screens
        minHeight: '300px' // Minimum height
      }}>
        <Bar
          data={membershipData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Months'
                },
                ticks: {
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12
                  }
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Entries'
                },
                beginAtZero: true,
                ticks: {
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12
                  }
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: `Membership and Walk-in Data for ${selectedYear}`,
                font: {
                  size: window.innerWidth < 768 ? 14 : 16
                }
              },
              legend: {
                display: true,
                position: 'top',
                labels: {
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12
                  }
                }
              }
            }
          }}
        />
      </div>
      <div className="summary-stats">
        <div className="stat-box">
          <h3>Total Members</h3>
          <p>{totalMembers}</p>
        </div>
        <div className="stat-box">
          <h3>Total Walk-ins</h3>
          <p>{totalWalkIns}</p>
        </div>
      </div>
    </div>
  );
}

export default MemberCounting;