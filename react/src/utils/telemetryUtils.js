export const assignMarshalSectorsByDistance = (driverData, trackInfo) => {
    return driverData.map((point, j) => {
        let assignedSector = null;

        for (let i = 0; i < trackInfo.length; i++) {
            const currentSector = trackInfo[i];
            const nextSector = trackInfo[(i + 1) % trackInfo.length];

            if (
                point.Distance >= currentSector.Distance &&
                point.Distance < nextSector.Distance
            ) {
                assignedSector = currentSector.Number;
                break;
            } else if (
                point.Distance >= currentSector.Distance &&
                i === trackInfo.length - 1
            ) {
                assignedSector = 1;
                break;
            }
        }

        if (assignedSector === null && point.Distance < trackInfo[0].Distance) {
            assignedSector = trackInfo[0].Number;
        }

        return { ...point, marshal_sector: assignedSector };
    });
};
