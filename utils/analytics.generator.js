// async function generateLast12MonthsData(model) {
//     const last12Months = [];
//     const currentDate = new Date();
//     currentDate.setDate(currentDate.getDate() + 1);

//     for (let i = 11; i >= 0; i--) {
//         const endDate = new Date(
//             currentDate.getFullYear(),
//             currentDate.getMonth(),
//             currentDate.getDate() - i * 28,
//         );
//         const startDate = new Date(
//             endDate.getFullYear(),
//             endDate.getMonth(),
//             endDate.getDate() - 28,
//         );
//         const monthYear = endDate.toLocaleString("default", {
//             day: "numeric",
//             month: "short",
//             year: "numeric",
//         });

//         const count = await model.countDocuments({
//             createdAt: { $gte: startDate, $lt: endDate },
//         });

//         last12Months.push({ month: monthYear, count });
//     }

//     return { last12Months };
// }

async function generateLast12MonthsData(model) {
    const last12Months = [];
    const now = new Date();

    // Helper: normalize a date to UTC start of day
    function startOfUtcDay(d) {
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
    }

    // Helper: normalize a date to UTC end of day
    function endOfUtcDay(d) {
        return new Date(
            Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999),
        );
    }

    // Build the 12 windows (each 28 days), going backwards.
    // Window i has end = today - (i * 28) days, start = end - 27 days.
    const windows = [];
    for (let i = 11; i >= 0; i--) {
        const rawEnd = new Date(now);
        rawEnd.setUTCDate(rawEnd.getUTCDate() - i * 28);
        const rawStart = new Date(rawEnd);
        rawStart.setUTCDate(rawEnd.getUTCDate() - 27);

        const startDate = startOfUtcDay(rawStart);
        const endDate = endOfUtcDay(rawEnd);
        windows.push({ startDate, endDate });
    }

    // Fire all countDocuments in parallel for performance.
    const counts = await Promise.all(
        windows.map(({ startDate, endDate }) =>
            model.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate },
            }),
        ),
    );

    // Format label like "Jul 05, 2025 - Aug 01, 2025"
    function formatShort(date) {
        return date.toLocaleString("default", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    for (let idx = 0; idx < windows.length; idx++) {
        const { startDate, endDate } = windows[idx];
        const label = `${formatShort(startDate)} - ${formatShort(endDate)}`;
        last12Months.push({ month: label, count: counts[idx] });
    }

    return { last12Months };
}

module.exports = { generateLast12MonthsData };
