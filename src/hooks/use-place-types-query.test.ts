import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, createElement } from "react";
import {
  usePlaceTypes,
  usePlaceType,
  usePlaceTypeUsage,
  useCreatePlaceType,
  useUpdatePlaceType,
  useDeletePlaceType,
} from "./use-place-types-query";
import { placeTypes } from "../lib/place-types";
import {
  PlaceType,
  CreatePlaceTypeInput,
  UpdatePlaceTypeInput,
} from "../lib/db/types";

// Mock the placeTypes module
vi.mock("../lib/place-types", () => ({
  placeTypes: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getUsageCount: vi.fn(),
  },
}));

const mockPlaceTypes = vi.mocked(placeTypes);

describe("use-place-types-query hooks", () => {
  let queryClient: QueryClient;

  const mockPlaceType: PlaceType = {
    id: "mock-uuid-1234",
    created_at: "2025-09-07T10:00:00Z",
    name: "Country",
    key: null,
  };

  const mockSystemPlaceType: PlaceType = {
    id: "mock-uuid-system",
    created_at: "2025-09-07T10:00:00Z",
    name: "State",
    key: "state",
  };

  const createWrapper = ({ children }: { children: ReactNode }) => {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe("usePlaceTypes", () => {
    it("should fetch place types", async () => {
      const mockPlaceTypesList = [mockPlaceType, mockSystemPlaceType];
      mockPlaceTypes.getAll.mockResolvedValue(mockPlaceTypesList);

      const { result } = renderHook(() => usePlaceTypes("test-tree"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceTypes.getAll).toHaveBeenCalledWith("test-tree");
      expect(result.current.data).toEqual(mockPlaceTypesList);
    });

    it("should handle fetch error", async () => {
      const mockError = new Error("Failed to fetch place types");
      mockPlaceTypes.getAll.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePlaceTypes("test-tree"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("usePlaceType", () => {
    it("should fetch place type by id", async () => {
      mockPlaceTypes.getById.mockResolvedValue(mockPlaceType);

      const { result } = renderHook(
        () => usePlaceType("test-tree", "place-type-id"),
        {
          wrapper: createWrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceTypes.getById).toHaveBeenCalledWith(
        "test-tree",
        "place-type-id",
      );
      expect(result.current.data).toEqual(mockPlaceType);
    });

    it("should not fetch when placeTypeId is empty", () => {
      const { result } = renderHook(() => usePlaceType("test-tree", ""), {
        wrapper: createWrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockPlaceTypes.getById).not.toHaveBeenCalled();
    });
  });

  describe("usePlaceTypeUsage", () => {
    it("should fetch usage count for place type", async () => {
      mockPlaceTypes.getUsageCount.mockResolvedValue(5);

      const { result } = renderHook(
        () => usePlaceTypeUsage("test-tree", "place-type-id"),
        {
          wrapper: createWrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceTypes.getUsageCount).toHaveBeenCalledWith(
        "test-tree",
        "place-type-id",
      );
      expect(result.current.data).toBe(5);
    });
  });

  describe("useCreatePlaceType", () => {
    it("should create place type and invalidate cache", async () => {
      const newPlaceType: CreatePlaceTypeInput = {
        name: "City",
        key: "city",
      };
      mockPlaceTypes.create.mockResolvedValue(mockPlaceType);

      const { result } = renderHook(() => useCreatePlaceType("test-tree"), {
        wrapper: createWrapper,
      });

      const spy = vi.spyOn(queryClient, "invalidateQueries");

      result.current.mutate(newPlaceType);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceTypes.create).toHaveBeenCalledWith(
        "test-tree",
        newPlaceType,
      );

      // Check that cache is invalidated
      expect(spy).toHaveBeenCalledWith({
        queryKey: ["place-types", "test-tree", "place-types"],
      });
      expect(spy).toHaveBeenCalledWith({
        queryKey: ["places", "test-tree", "place-types"],
      });

      spy.mockRestore();
    });
  });

  describe("useUpdatePlaceType", () => {
    it("should update place type and invalidate cache", async () => {
      const updates: UpdatePlaceTypeInput = { name: "Updated City" };
      const updatedPlaceType = { ...mockPlaceType, name: "Updated City" };
      mockPlaceTypes.update.mockResolvedValue(updatedPlaceType);

      const { result } = renderHook(() => useUpdatePlaceType("test-tree"), {
        wrapper: createWrapper,
      });

      const spy = vi.spyOn(queryClient, "invalidateQueries");
      const setDataSpy = vi.spyOn(queryClient, "setQueryData");

      result.current.mutate({
        placeTypeId: "place-type-id",
        updates,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceTypes.update).toHaveBeenCalledWith(
        "test-tree",
        "place-type-id",
        updates,
      );

      // Check that specific place type is updated in cache
      expect(setDataSpy).toHaveBeenCalledWith(
        ["place-types", "test-tree", "place-types", "place-type-id"],
        updatedPlaceType,
      );

      // Check that cache is invalidated
      expect(spy).toHaveBeenCalledWith({
        queryKey: ["place-types", "test-tree", "place-types"],
      });

      spy.mockRestore();
      setDataSpy.mockRestore();
    });
  });

  describe("useDeletePlaceType", () => {
    it("should delete place type and invalidate cache", async () => {
      mockPlaceTypes.delete.mockResolvedValue();

      const { result } = renderHook(() => useDeletePlaceType("test-tree"), {
        wrapper: createWrapper,
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const removeSpy = vi.spyOn(queryClient, "removeQueries");

      result.current.mutate("place-type-id");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPlaceTypes.delete).toHaveBeenCalledWith(
        "test-tree",
        "place-type-id",
      );

      // Check that specific queries are removed
      expect(removeSpy).toHaveBeenCalledWith({
        queryKey: ["place-types", "test-tree", "place-types", "place-type-id"],
      });
      expect(removeSpy).toHaveBeenCalledWith({
        queryKey: ["place-types", "test-tree", "usage", "place-type-id"],
      });

      // Check that cache is invalidated
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["place-types", "test-tree", "place-types"],
      });

      invalidateSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe("error handling", () => {
    it("should handle create place type errors", async () => {
      const mockError = new Error("Failed to create place type");
      mockPlaceTypes.create.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreatePlaceType("test-tree"), {
        wrapper: createWrapper,
      });

      result.current.mutate({ name: "Test Type" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it("should handle update place type errors", async () => {
      const mockError = new Error("Cannot modify system place type");
      mockPlaceTypes.update.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdatePlaceType("test-tree"), {
        wrapper: createWrapper,
      });

      result.current.mutate({
        placeTypeId: "system-type-id",
        updates: { name: "New Name" },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it("should handle delete place type errors", async () => {
      const mockError = new Error("Cannot delete system place type");
      mockPlaceTypes.delete.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDeletePlaceType("test-tree"), {
        wrapper: createWrapper,
      });

      result.current.mutate("system-type-id");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });
});
