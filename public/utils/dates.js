//we want to get the stock data for the last 3 days
function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getDateNDaysAgo(n) {
    const now = new Date(); // current date and time
    now.setDate(now.getDate() - n); // subtract n days
    return formatDate(now);
}

export const dates = {
    startDate: getDateNDaysAgo(3), // 3 days ago alter to increase/decrease the data set
    endDate: getDateNDaysAgo(1)// instead of today leave at 1 to get yesterd
}
