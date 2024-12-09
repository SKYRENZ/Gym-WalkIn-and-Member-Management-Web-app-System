
import "../../csscounter/Counter.css";


const OverviewCards = () => {
    const data = [
        { title: "Walked In", count: 20, description: "Walk-in Entries", icon: "🚶" },
        { title: "Checked-In", count: 13, description: "Check-in Entries", icon: "💻" },
        { title: "New Members", count: 18, description: "Recently Registered Users", icon: "👤" },
        { title: "Voucher Codes", count: 4, description: "Remaining Redeemable Vouchers", icon: "🎟️" },
    ];

    return (
        <div className="overview-cards">
            {data.map((item, index) => (
                <div key={index} className="card">
                    <div className="card-header">
                        <h3>{item.title}</h3>
                        <span>{item.icon}</span>
                    </div>
                    <p>{item.count}</p>
                    <small>{item.description}</small>
                </div>
            ))}
        </div>
    );
};

export default OverviewCards;
