import { useState } from 'react';
import { useIncomeSummary } from '../../hooks/useIncomeSummary';
import IncomeChart from './IncomeChart';
import IncomeSummaryStats from './IncomeSummaryStats';
import { Spinner, ErrorMessage } from './StatusComponents';
import '../../css/admin/IncomeSummary.css'; // Ensure CSS is imported

function IncomeSummary() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { incomeData, isLoading, error } = useIncomeSummary(
        selectedYear, 
        selectedPeriod, 
        selectedPeriod === 'daily' ? selectedDate.toISOString().split('T')[0] : null
    );

    if (isLoading) return <Spinner message="Loading income data..." />;
    if (error) return <ErrorMessage message={error} />;
    if (!incomeData) return <ErrorMessage message="No income data available" />;

    return (
        <div className="income-summary-container">
            <div className="income-summary-header">
                <h1>Income Summary</h1>
                <div className="filter-container">
                    <div>
                        <label>Select Year:</label>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            disabled={selectedPeriod === 'daily'}
                        >
                            {[2021, 2022, 2023, 2024].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Select Period:</label>
                        <select 
                            value={selectedPeriod} 
                            onChange={(e) => {
                                setSelectedPeriod(e.target.value);
                                // Reset to current year when switching to monthly
                                if (e.target.value === 'monthly') {
                                    setSelectedYear(new Date().getFullYear());
                                }
                            }}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="daily">Daily</option>
                        </select>
                    </div>
                    {selectedPeriod === 'daily' && (
                        <div>
                            <label>Select Date:</label>
                            <input 
                                type="date" 
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="income-summary-content">
                <div className="chart-container">
                    <IncomeChart 
                        walkInIncomeData={incomeData.walkInIncomeByPeriod || {}}
                        memberIncomeData={incomeData.memberIncomeByPeriod || {}}
                        period={selectedPeriod}
                    />
                </div>
            </div>

            <div className="summary-stats">
                <IncomeSummaryStats 
                    totalWalkInIncome={incomeData.totalWalkInIncome}
                    totalMemberIncome={incomeData.totalMemberIncome}
                    totalIncome={incomeData.totalIncome}
                    period={selectedPeriod}
                    selectedDate={selectedPeriod === 'daily' ? selectedDate : null}
                />
            </div>
        </div>
    );
}

export default IncomeSummary;