import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function IncomeChart({ walkInIncomeData, memberIncomeData, period }) {
    const chartData = React.useMemo(() => {
        // Enhanced logging
        console.log('Income Chart Debug:', {
            walkInIncomeData,
            memberIncomeData,
            period
        });

        // Handle daily data
        if (period === 'daily') {
            // Get the first (and likely only) date key
            const dailyDate = Object.keys(walkInIncomeData)[0];
            
            // Convert date object to a readable label
            const dateLabel = dailyDate instanceof Date 
                ? dailyDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }) 
                : 'Today';

            console.log('Daily Date:', dailyDate);
            console.log('Date Label:', dateLabel);
            console.log('Walk-In Income:', walkInIncomeData[dailyDate]);
            console.log('Member Income:', memberIncomeData[dailyDate]);

            return {
                labels: [dateLabel],
                datasets: [
                    {
                        label: 'Walk-In Income',
                        data: [walkInIncomeData[dailyDate] || 0],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Member Income',
                        data: [memberIncomeData[dailyDate] || 0],
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            };
        }

        // Existing monthly logic remains the same
        const monthLabels = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        return {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Walk-In Income',
                    data: monthLabels.map((_, index) => walkInIncomeData[index + 1] || 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Member Income',
                    data: monthLabels.map((_, index) => memberIncomeData[index + 1] || 0),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        };
    }, [walkInIncomeData, memberIncomeData, period]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Income ${period === 'monthly' ? 'Monthly' : 'Daily'} Breakdown`
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Income (₱)'
                },
                ticks: {
                    callback: function(value) {
                        return '₱' + value.toLocaleString();
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: period === 'monthly' ? 'Months' : 'Date'
                }
            }
        }
    };

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}

// Add PropTypes validation
IncomeChart.propTypes = {
    walkInIncomeData: PropTypes.object,
    memberIncomeData: PropTypes.object,
    period: PropTypes.oneOf(['monthly', 'daily']).isRequired
};

// Add default props to prevent errors
IncomeChart.defaultProps = {
    walkInIncomeData: {},
    memberIncomeData: {}
};

export default IncomeChart;