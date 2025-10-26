export const generateTrackingId = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substr(2, 6);
    return `TRK-${datePart}-${randomPart}`;
};