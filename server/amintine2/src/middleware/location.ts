import { Context, Next } from "hono";

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const TARGET_COORDINATE = [28.54389941413573, 77.33301950819329];
const TARGET_DISTANCE = 0.6;

const inRange = (lat: number, lon: number) => {
  return (
    getDistanceFromLatLonInKm(
      lat,
      lon,
      TARGET_COORDINATE[0],
      TARGET_COORDINATE[1]
    ) < TARGET_DISTANCE
  );
};

export const locationMiddleware = async (c: Context, next: Next) => {
  const { position } = await c.req.json();

  if (!position.latitude || !position.longitude) {
    return c.json({ error: "Location data required." }, 400);
  }

  console.log(position);

  if (!inRange(position.latitude, position.longitude)) {
    return c.json({ error: "You are far from the Amity University." }, 401);
  }

  await next();
};
