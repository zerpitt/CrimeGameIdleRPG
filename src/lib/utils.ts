const SUFFIXES = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'
];

export const formatNumber = (num: number): string => {
    if (num < 1000) return Math.floor(num).toString();

    // Determine suffix index
    // 1000 = 10^3 -> index 1
    // 1e6 = 10^6 -> index 2
    // index = floor(log10(num) / 3)
    const suffixIndex = Math.floor(Math.log10(num) / 3);

    if (suffixIndex >= SUFFIXES.length) {
        return num.toExponential(2); // Fallback for extremely large numbers
    }

    const value = num / Math.pow(10, suffixIndex * 3);

    // If value is >= 100 (e.g. 150K), no decimals.
    // If value < 100 (e.g. 1.5K, 15.5K), 2 decimal. Actually 2 decimals is good generally.
    // Let's stick to 2 decimal places for precision in idle games.
    // But trim trailing zeros? e.g. 1.00K -> 1K

    const formatted = value.toFixed(2);
    return formatted.endsWith('.00')
        ? formatted.slice(0, -3) + SUFFIXES[suffixIndex]
        : formatted + SUFFIXES[suffixIndex];
};

export const formatMoney = (amount: number): string => {
    return '$' + formatNumber(amount);
};

export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};
