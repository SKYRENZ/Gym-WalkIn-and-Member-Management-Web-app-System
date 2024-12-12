import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../../css/admin/MemberCounting.css';

// Register all necessary components
Chart.register(...registerables);

function MemberCounting() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [membershipData, setMembershipData] = useState({
    labels: [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    datasets: [
      {
        label: 'Members',
        data: new Array(12).fill(0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Walk-ins',
        data: new Array(12).fill(0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  });

  // Fetch available years on component mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const yearsResponse = await fetch('http://localhost:3000/getAvailableYears');
        const yearsData = await yearsResponse.json();
        
        // Ensure years are sorted in descending order
        const sortedYears = yearsData.years.sort((a, b) => b - a);
        
        setAvailableYears(sortedYears);
        
        // If current year is not in the list, set to the first available year
        if (!sortedYears.includes(selectedYear)) {
          setSelectedYear(sortedYears[0] || new Date().getFullYear());
        }
      } catch (error) {
        console.error('Error fetching available years:', error);
        // Fallback to current year if fetch fails
        setAvailableYears([new Date().getFullYear()]);
      }
    };

    fetchAvailableYears();
  }, []);

  // Fetch membership data when year changes
  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        // Fetch memberships
        const memberResponse = await fetch(`http://localhost:3000/memberships?year=${selectedYear}`);
        const memberData = await memberResponse.json();

        // Fetch walk-in data
        const walkInResponse = await fetch(`http://localhost:3000/getWalkInCustomerRecords?year=${selectedYear}`);
        const walkInData = await walkInResponse.json();

        // Initialize monthly data with zeros
        const monthlyData = {
          January: { members: 0, walkIns: 0 },
          February: { members: 0, walkIns: 0 },
          March: { members: 0, walkIns: 0 },
          April: { members: 0, walkIns: 0 },
          May: { members: 0, walkIns: 0 },
          June: { members: 0, walkIns: 0 },
          July: { members: 0, walkIns: 0 },
          August: { members: 0, walkIns: 0 },
          September: { members: 0, walkIns: 0 },
          October: { members: 0, walkIns: 0 },
          November: { members: 0, walkIns: 0 },
          December: { members: 0, walkIns: 0 }
        };

        // Count members for each month
        memberData.forEach(member => {
          const month = new Date(member.start_date).toLocaleString('default', { month: 'long' });
          monthlyData[month].members++;
        });

        // Count walk-ins for each month
        walkInData.forEach(walkIn => {
          if (walkIn.recent_payment_date) {
            const month = new Date(walkIn.recent_payment_date).toLocaleString('default', { month: 'long' });
            monthlyData[month].walkIns++;
          }
        });

        // Prepare data for the chart
        const chartData = {
          labels: Object.keys(monthlyData),
          datasets: [
            {
              label: 'Members',
              data: Object.values(monthlyData).map(data => data.members),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Walk-ins',
              data: Object.values(monthlyData).map(data => data.walkIns),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        };

        setMembershipData(chartData);
      } catch (error) {
        console.error('Error fetching membership and walk-in data:', error);
        // Fallback to empty data if fetch fails
        setMembershipData(prevState => ({
          ...prevState,
          datasets: [
            { ...prevState.datasets[0], data: new Array(12).fill(0) },
            { ...prevState.datasets[1], data: new Array(12).fill(0) }
          ]
        }));
      }
    };

    fetchMembershipData();
  }, [selectedYear]);

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
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ width: '100%', height: '400px' }}>
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
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Entries'
                },
                beginAtZero: true
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default MemberCounting;