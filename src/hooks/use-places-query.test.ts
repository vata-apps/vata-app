import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, createElement } from "react";
import {
  usePlaceTypes,
  usePlaceType,
  useCreatePlaceType,
  usePlaces,
  usePlace,
  usePlacesWithTypes,
  useChildren,
  useChildrenCount,
  useCreatePlace,
  useUpdatePlace,
  useDeletePlace,
  useInitializePlacesDb,
} from "./use-places-query";
import { places } from "../lib/places";
import {
  PlaceType,
  Place,
  CreatePlaceInput,
  UpdatePlaceInput,
} from "../lib/db/types";

// Mock the places module
vi.mock("../lib/places", () => ({
  places: {
    getPlaceTypes: vi.fn(),
    getPlaceType: vi.fn(),
    createPlaceType: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    getAllWithTypes: vi.fn(),
    getChildren: vi.fn(),
    getChildrenCount: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    initDatabase: vi.fn(),
  },
}));

const mockPlaces = places as {
  getPlaceTypes: ReturnType<typeof vi.fn>;
  getPlaceType: ReturnType<typeof vi.fn>;
  createPlaceType: ReturnType<typeof vi.fn>;
  getAll: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  getAllWithTypes: ReturnType<typeof vi.fn>;
  getChildren: ReturnType<typeof vi.fn>;
  getChildrenCount: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  initDatabase: ReturnType<typeof vi.fn>;
};

describe("use-places-query", () => {
  const testTreeId = "test-tree";
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  const mockPlaceType: PlaceType = {
    id: "place-type-1",
    created_at: "2025-09-07T10:00:00Z",
    name: "Country",
    key: "country",
  };

  const mockPlace: Place = {
    id: "place-1",
    created_at: "2025-09-07T10:00:00Z",
    name: "France",
    type_id: "place-type-1",
    parent_id: null,
    latitude: 46.2276,
    longitude: 2.2137,
    gedcom_id: null,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  describe("usePlaceTypes", () => {
    it("should fetch place types successfully", async () => {
      const placeTypes = [mockPlaceType];
      mockPlaces.getPlaceTypes.mockResolvedValue(placeTypes);

      const { result } = renderHook(() => usePlaceTypes(testTreeId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.getPlaceTypes).toHaveBeenCalledWith(testTreeId);
      expect(result.current.data).toEqual(placeTypes);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle errors when fetching place types", async () => {
      const error = new Error("Failed to fetch place types");
      mockPlaces.getPlaceTypes.mockRejectedValue(error);

      const { result } = renderHook(() => usePlaceTypes(testTreeId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe("usePlaceType", () => {
    it("should fetch single place type successfully", async () => {
      mockPlaces.getPlaceType.mockResolvedValue(mockPlaceType);

      const { result } = renderHook(
        () => usePlaceType(testTreeId, "place-type-1"),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.getPlaceType).toHaveBeenCalledWith(
        testTreeId,
        "place-type-1",
      );
      expect(result.current.data).toEqual(mockPlaceType);
    });

    it("should be disabled when placeTypeId is empty", async () => {
      const { result } = renderHook(() => usePlaceType(testTreeId, ""), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockPlaces.getPlaceType).not.toHaveBeenCalled();
    });
  });

  describe("useCreatePlaceType", () => {
    it("should create place type and invalidate cache", async () => {
      const newPlaceType = mockPlaceType;
      const createData = { name: "Country", key: "country" };
      mockPlaces.createPlaceType.mockResolvedValue(newPlaceType);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreatePlaceType(testTreeId), {
        wrapper,
      });

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.createPlaceType).toHaveBeenCalledWith(
        testTreeId,
        createData,
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "place-types"],
      });
    });
  });

  describe("usePlaces", () => {
    it("should fetch all places successfully", async () => {
      const places = [mockPlace];
      mockPlaces.getAll.mockResolvedValue(places);

      const { result } = renderHook(() => usePlaces(testTreeId), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.getAll).toHaveBeenCalledWith(testTreeId);
      expect(result.current.data).toEqual(places);
    });
  });

  describe("usePlace", () => {
    it("should fetch single place successfully", async () => {
      mockPlaces.getById.mockResolvedValue(mockPlace);

      const { result } = renderHook(() => usePlace(testTreeId, "place-1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.getById).toHaveBeenCalledWith(testTreeId, "place-1");
      expect(result.current.data).toEqual(mockPlace);
    });

    it("should be disabled when placeId is empty", async () => {
      const { result } = renderHook(() => usePlace(testTreeId, ""), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockPlaces.getById).not.toHaveBeenCalled();
    });
  });

  describe("usePlacesWithTypes", () => {
    it("should fetch places with types successfully", async () => {
      const placesWithTypes = [{ ...mockPlace, type: mockPlaceType }];
      mockPlaces.getAllWithTypes.mockResolvedValue(placesWithTypes);

      const { result } = renderHook(() => usePlacesWithTypes(testTreeId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.getAllWithTypes).toHaveBeenCalledWith(testTreeId);
      expect(result.current.data).toEqual(placesWithTypes);
    });
  });

  describe("useChildren", () => {
    it("should fetch children successfully", async () => {
      const children = [mockPlace];
      mockPlaces.getChildren.mockResolvedValue(children);

      const { result } = renderHook(() => useChildren(testTreeId, "parent-1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.getChildren).toHaveBeenCalledWith(
        testTreeId,
        "parent-1",
      );
      expect(result.current.data).toEqual(children);
    });

    it("should be disabled when parentId is empty", async () => {
      const { result } = renderHook(() => useChildren(testTreeId, ""), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockPlaces.getChildren).not.toHaveBeenCalled();
    });
  });

  describe("useChildrenCount", () => {
    it("should fetch children count successfully", async () => {
      mockPlaces.getChildrenCount.mockResolvedValue(5);

      const { result } = renderHook(
        () => useChildrenCount(testTreeId, "parent-1"),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.getChildrenCount).toHaveBeenCalledWith(
        testTreeId,
        "parent-1",
      );
      expect(result.current.data).toBe(5);
    });

    it("should be disabled when parentId is empty", async () => {
      const { result } = renderHook(() => useChildrenCount(testTreeId, ""), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockPlaces.getChildrenCount).not.toHaveBeenCalled();
    });
  });

  describe("useCreatePlace", () => {
    it("should create place and invalidate related queries", async () => {
      const newPlace = { ...mockPlace, parent_id: "parent-1" };
      const createData: CreatePlaceInput = {
        name: "Paris",
        typeId: "city-type",
        parentId: "parent-1",
        latitude: 48.8566,
        longitude: 2.3522,
        gedcomId: null,
      };
      mockPlaces.create.mockResolvedValue(newPlace);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreatePlace(testTreeId), {
        wrapper,
      });

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.create).toHaveBeenCalledWith(testTreeId, createData);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "places"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "places-with-types"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "children", "parent-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "children-count", "parent-1"],
      });
    });

    it("should not invalidate parent queries when place has no parent", async () => {
      const newPlace = { ...mockPlace, parent_id: null };
      const createData: CreatePlaceInput = {
        name: "France",
        typeId: "country-type",
        parentId: null,
        latitude: null,
        longitude: null,
        gedcomId: null,
      };
      mockPlaces.create.mockResolvedValue(newPlace);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreatePlace(testTreeId), {
        wrapper,
      });

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledTimes(2); // Only places and places-with-types
      expect(invalidateSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["children"]),
        }),
      );
    });
  });

  describe("useUpdatePlace", () => {
    it("should update place and invalidate related queries", async () => {
      const updatedPlace = {
        ...mockPlace,
        name: "Updated France",
        parent_id: "europe-1",
      };
      const updateData: UpdatePlaceInput = {
        name: "Updated France",
        parentId: "europe-1",
      };
      mockPlaces.update.mockResolvedValue(updatedPlace);

      const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdatePlace(testTreeId), {
        wrapper,
      });

      result.current.mutate({ placeId: "place-1", updates: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.update).toHaveBeenCalledWith(
        testTreeId,
        "place-1",
        updateData,
      );
      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ["places", testTreeId, "places", "place-1"],
        updatedPlace,
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "places"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "children", "europe-1"],
      });
    });
  });

  describe("useDeletePlace", () => {
    it("should delete place and clean up cache", async () => {
      mockPlaces.delete.mockResolvedValue(undefined);

      const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeletePlace(testTreeId), {
        wrapper,
      });

      result.current.mutate("place-1");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.delete).toHaveBeenCalledWith(testTreeId, "place-1");
      expect(removeQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "places", "place-1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "places"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId, "places-with-types"],
      });

      // Should invalidate children queries with predicate
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId],
        predicate: expect.any(Function),
      });
    });
  });

  describe("useInitializePlacesDb", () => {
    it("should initialize database and invalidate all tree queries", async () => {
      mockPlaces.initDatabase.mockResolvedValue(undefined);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useInitializePlacesDb(testTreeId), {
        wrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaces.initDatabase).toHaveBeenCalledWith(testTreeId);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["places", testTreeId],
      });
    });
  });
});
