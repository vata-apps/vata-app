import { invoke } from '@tauri-apps/api/core';
import { PlaceType, Place, NewPlace, NewPlaceType } from '../db/schema';

export const placesCommands = {
  // Initialize database with schema and default place types
  async initDatabase(treeName: string): Promise<void> {
    return await invoke('init_tree_database', { treeName });
  },

  // Place Types CRUD
  async getPlaceTypes(treeName: string): Promise<PlaceType[]> {
    return await invoke('get_place_types', { treeName });
  },

  async createPlaceType(treeName: string, placeType: Omit<NewPlaceType, 'id' | 'createdAt'>): Promise<PlaceType> {
    return await invoke('create_place_type', { treeName, placeType });
  },

  // Places CRUD
  async getPlaces(treeName: string): Promise<Place[]> {
    return await invoke('get_places', { treeName });
  },

  async getPlace(treeName: string, id: number): Promise<Place | null> {
    return await invoke('get_place', { treeName, id });
  },

  async createPlace(treeName: string, place: Omit<NewPlace, 'id' | 'createdAt'>): Promise<Place> {
    return await invoke('create_place', { treeName, place });
  },

  async updatePlace(treeName: string, id: number, place: Partial<Omit<Place, 'id' | 'createdAt'>>): Promise<Place> {
    return await invoke('update_place', { treeName, id, place });
  },

  async deletePlace(treeName: string, id: number): Promise<void> {
    return await invoke('delete_place', { treeName, id });
  },

  // Get places with hierarchy info
  async getPlacesWithTypes(treeName: string): Promise<(Place & { type: PlaceType })[]> {
    return await invoke('get_places_with_types', { treeName });
  },

  async getPlaceChildren(treeName: string, parentId: number): Promise<Place[]> {
    return await invoke('get_place_children', { treeName, parentId });
  },
};