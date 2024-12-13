import  { useMemo } from 'react';
import PropTypes from 'prop-types';

function IncomeSummaryStats({ walkInData, membershipData, selectedPeriod }) {
  const { walkInTotal, membershipTotal } = useMemo(() => {
    const calculateTotal = (data) => {
      const today = new Date();
      const filteredData = selectedPeriod === 'daily'
        ? data.filter(entry => new Date(entry.date).toDateString() === today.toDateString())
        : data;

      return filteredData.reduce((sum, entry) => sum + (entry.total_income || 0), 0);
    };

    return {
      walkInTotal: calculateTotal(walkInData),
      membershipTotal: calculateTotal(membershipData)
    };
  }, [walkInData, membershipData, selectedPeriod]);

  const totalIncome = walkInTotal + membershipTotal;

  return (
    <div className="summary-stats">
      <div className="stat-box">
        <h3>Walk-in Income</h3>
        <p>₱{walkInTotal.toFixed(2)}</p>
      </div>
      <div className="stat-box">
        <h3>Membership Income</h3>
        <p>₱{membershipTotal.toFixed(2)}</p>
      </div>
      <div className="stat-box">
        <h3>Total Income</h3>
        <p>₱{totalIncome.toFixed(2)}</p>
      </div>
    </div>
  );
}

IncomeSummaryStats.propTypes = {
  walkInData: PropTypes.array.isRequired,
  membershipData: PropTypes.array.isRequired,
  selectedPeriod: PropTypes.string.isRequired
};

export default IncomeSummaryStats;