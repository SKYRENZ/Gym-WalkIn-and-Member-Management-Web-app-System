import  { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js'; // Import Chart and registerables
import '../../css/admin/MemberCounting.css';

// Register all necessary components
Chart.register(...registerables);

function MemberCounting() {
  const [membershipData, setMembershipData] = useState({});

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const response = await fetch('http://localhost:3000/memberships'); // Fetch from your memberships endpoint
        const data = await response.json();

        // Process the data to count active and expired memberships
        const activeCount = data.filter(member => member.status === 'Active').length;
        const expiredCount = data.filter(member => member.status === 'Expired').length;

        // Set the data for the bar graph
        setMembershipData({
          labels: ['Active', 'Expired'],
          datasets: [
            {
              label: 'Membership Count',
              data: [activeCount, expiredCount],
              backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
              borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching membership data:', error);
      }
    };

    fetchMembershipData();
  }, []);

  return (
    <div className="member-counting">
      <h1>Member Counting</h1> {/* Header above the graph */}
      {membershipData.labels ? (
        <div style={{ width: '100%', height: '400px' }}> {/* Set a height for the chart container */}
          <Bar
            data={membershipData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default MemberCounting;