import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function IncomeChart({ walkInIncomeData, memberIncomeData, period }) {
    const chartData = useMemo(() => {
        // Ensure we have valid data objects
        const walkInData = walkInIncomeData || {};
        const memberData = memberIncomeData || {};

        // Monthly labels
        const monthLabels = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        // Handle monthly data
        if (period === 'monthly') {
            return {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Walk-In Income',
                        data: monthLabels.map((_, index) => walkInData[index + 1] || 0),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Member Income',
                        data: monthLabels.map((_, index) => memberData[index + 1] || 0),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            };
        }

        // Handle daily data (single day)
        return {
            labels: ['Today'],
            datasets: [
                {
                    label: 'Walk-In Income',
                    data: [walkInData[Object.keys(walkInData)[0]] || 0],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                    label: 'Member Income',
                    data: [memberData[Object.keys(memberData)[0]] || 0],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
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
                    // Add comma formatting to y-axis labels
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
        <div style={{ height: '400px', width: '100%' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default IncomeChart;