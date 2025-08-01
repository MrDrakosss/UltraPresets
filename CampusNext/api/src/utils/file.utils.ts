export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size = size / 1024;
        unitIndex++;
    }

    const rounded = Math.round(size * 10) / 10;
    const isInteger = Number.isInteger(rounded);

    return isInteger
        ? `${rounded.toFixed(0)} ${units[unitIndex]}`
        : `${rounded.toFixed(1)} ${units[unitIndex]}`;
}