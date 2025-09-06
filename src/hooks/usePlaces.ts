import { useState, useEffect } from "react";
import { places } from "../lib/places";
import { Place, PlaceType } from "../lib/db/schema";
import { PlaceFormData } from "../lib/db/types";

export function usePlaces(treeId: string) {
  const [placesList, setPlacesList] = useState<Place[]>([]);
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [placesData, typesData] = await Promise.all([
        places.getAll(treeId),
        places.getPlaceTypes(treeId),
      ]);
      setPlacesList(placesData);
      setPlaceTypes(typesData);
    } catch (err) {
      setError(`Error loading places: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const createPlace = async (formData: PlaceFormData) => {
    try {
      const createdPlace = await places.create(treeId, {
        name: formData.name,
        typeId: formData.typeId,
        parentId: formData.parentId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        gedcomId: null,
      });
      setPlacesList([...placesList, createdPlace]);
      return createdPlace;
    } catch (err) {
      setError(`Error creating place: ${err}`);
      throw err;
    }
  };

  const updatePlace = async (placeId: string, formData: PlaceFormData) => {
    try {
      const updatedPlace = await places.update(treeId, placeId, {
        name: formData.name,
        typeId: formData.typeId,
        parentId: formData.parentId,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      setPlacesList(
        placesList.map((p) => (p.id === placeId ? updatedPlace : p))
      );
      return updatedPlace;
    } catch (err) {
      setError(`Error updating place: ${err}`);
      throw err;
    }
  };

  const deletePlace = async (placeId: string) => {
    try {
      const childrenCount = await places.getChildrenCount(treeId, placeId);
      if (childrenCount > 0) {
        // In a real app, show confirmation dialog here
        console.warn(`Place has ${childrenCount} children`);
      }
      await places.delete(treeId, placeId);
      setPlacesList(placesList.filter((p) => p.id !== placeId));
    } catch (err) {
      setError(`Error deleting place: ${err}`);
      throw err;
    }
  };

  useEffect(() => {
    loadData();
  }, [treeId]);

  return {
    placesList,
    placeTypes,
    loading,
    error,
    loadData,
    createPlace,
    updatePlace,
    deletePlace,
  };
}