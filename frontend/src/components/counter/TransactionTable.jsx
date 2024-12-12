import '../../css/counter/TransactionTable.css';

function TransactionsTable() {
    return (
        <div className="transactions-table-container">
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Mode of Payment</th>
                        <th>Transaction Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default TransactionsTable;