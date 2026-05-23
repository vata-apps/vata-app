import { getAllPlaces, getPlaceById } from '$db-tree/places';
import type { Place } from '$types/database';

export class PlaceManager {
  static async getAll(): Promise<Place[]> {
    return getAllPlaces();
  }

  static async getById(id: string): Promise<Place | null> {
    return getPlaceById(id);
  }
}
