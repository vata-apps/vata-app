import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, createElement } from "react";
import {
  useEventTypes,
  useEventType,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
} from "./use-event-types-query";
import { eventTypes } from "../lib/event-types";
import {
  EventType,
  CreateEventTypeInput,
  UpdateEventTypeInput,
} from "../lib/db/types";

// Mock the eventTypes module
vi.mock("../lib/event-types", () => ({
  eventTypes: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockEventTypes = vi.mocked(eventTypes);

describe("use-event-types-query hooks", () => {
  let queryClient: QueryClient;

  const mockEventType: EventType = {
    id: "mock-uuid-1234",
    created_at: "2025-09-07T10:00:00Z",
    name: "Wedding",
    key: null,
  };

  const mockDefaultEventType: EventType = {
    id: "mock-uuid-default",
    created_at: "2025-09-07T10:00:00Z",
    name: "Birth",
    key: "birth",
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

  describe("useEventTypes", () => {
    it("should fetch event types", async () => {
      const mockEventTypesList = [mockEventType, mockDefaultEventType];
      mockEventTypes.getAll.mockResolvedValue(mockEventTypesList);

      const { result } = renderHook(() => useEventTypes("test-tree"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockEventTypes.getAll).toHaveBeenCalledWith("test-tree");
      expect(result.current.data).toEqual(mockEventTypesList);
    });

    it("should handle fetch error", async () => {
      const mockError = new Error("Failed to fetch event types");
      mockEventTypes.getAll.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventTypes("test-tree"), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useEventType", () => {
    it("should fetch event type by id", async () => {
      mockEventTypes.getById.mockResolvedValue(mockEventType);

      const { result } = renderHook(
        () => useEventType("test-tree", "event-type-id"),
        {
          wrapper: createWrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockEventTypes.getById).toHaveBeenCalledWith(
        "test-tree",
        "event-type-id",
      );
      expect(result.current.data).toEqual(mockEventType);
    });

    it("should not fetch when eventTypeId is empty", () => {
      const { result } = renderHook(() => useEventType("test-tree", ""), {
        wrapper: createWrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockEventTypes.getById).not.toHaveBeenCalled();
    });

    it("should handle null response", async () => {
      mockEventTypes.getById.mockResolvedValue(null);

      const { result } = renderHook(
        () => useEventType("test-tree", "nonexistent-id"),
        {
          wrapper: createWrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe("useCreateEventType", () => {
    it("should create event type and invalidate cache", async () => {
      const newEventType: CreateEventTypeInput = {
        name: "Graduation",
        key: "graduation",
      };
      mockEventTypes.create.mockResolvedValue(mockEventType);

      const { result } = renderHook(() => useCreateEventType("test-tree"), {
        wrapper: createWrapper,
      });

      const spy = vi.spyOn(queryClient, "invalidateQueries");

      result.current.mutate(newEventType);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockEventTypes.create).toHaveBeenCalledWith(
        "test-tree",
        newEventType,
      );

      // Check that cache is invalidated
      expect(spy).toHaveBeenCalledWith({
        queryKey: ["event-types", "test-tree", "event-types"],
      });

      spy.mockRestore();
    });

    it("should handle create event type errors", async () => {
      const mockError = new Error("Failed to create event type");
      mockEventTypes.create.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateEventType("test-tree"), {
        wrapper: createWrapper,
      });

      result.current.mutate({ name: "Test Event" });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useUpdateEventType", () => {
    it("should update event type and invalidate cache", async () => {
      const updates: UpdateEventTypeInput = { name: "Updated Wedding" };
      const updatedEventType = { ...mockEventType, name: "Updated Wedding" };
      mockEventTypes.update.mockResolvedValue(updatedEventType);

      const { result } = renderHook(() => useUpdateEventType("test-tree"), {
        wrapper: createWrapper,
      });

      const spy = vi.spyOn(queryClient, "invalidateQueries");
      const setDataSpy = vi.spyOn(queryClient, "setQueryData");

      result.current.mutate({
        eventTypeId: "event-type-id",
        updates,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockEventTypes.update).toHaveBeenCalledWith(
        "test-tree",
        "event-type-id",
        updates,
      );

      // Check that specific event type is updated in cache
      expect(setDataSpy).toHaveBeenCalledWith(
        ["event-types", "test-tree", "event-types", "event-type-id"],
        updatedEventType,
      );

      // Check that cache is invalidated
      expect(spy).toHaveBeenCalledWith({
        queryKey: ["event-types", "test-tree", "event-types"],
      });

      spy.mockRestore();
      setDataSpy.mockRestore();
    });

    it("should handle update event type errors", async () => {
      const mockError = new Error("Event type not found");
      mockEventTypes.update.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateEventType("test-tree"), {
        wrapper: createWrapper,
      });

      result.current.mutate({
        eventTypeId: "nonexistent-id",
        updates: { name: "New Name" },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useDeleteEventType", () => {
    it("should delete event type and invalidate cache", async () => {
      mockEventTypes.delete.mockResolvedValue();

      const { result } = renderHook(() => useDeleteEventType("test-tree"), {
        wrapper: createWrapper,
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const removeSpy = vi.spyOn(queryClient, "removeQueries");

      result.current.mutate("event-type-id");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockEventTypes.delete).toHaveBeenCalledWith(
        "test-tree",
        "event-type-id",
      );

      // Check that specific queries are removed
      expect(removeSpy).toHaveBeenCalledWith({
        queryKey: ["event-types", "test-tree", "event-types", "event-type-id"],
      });

      // Check that cache is invalidated
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["event-types", "test-tree", "event-types"],
      });

      invalidateSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it("should handle delete event type errors", async () => {
      const mockError = new Error("Cannot delete default event type");
      mockEventTypes.delete.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDeleteEventType("test-tree"), {
        wrapper: createWrapper,
      });

      result.current.mutate("default-event-type-id");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("query key generation", () => {
    it("should use consistent query keys", async () => {
      const treeId = "test-tree";
      const eventTypeId = "event-type-123";

      // Test that queries use the expected keys
      mockEventTypes.getAll.mockResolvedValue([]);
      mockEventTypes.getById.mockResolvedValue(null);

      renderHook(() => useEventTypes(treeId), { wrapper: createWrapper });
      renderHook(() => useEventType(treeId, eventTypeId), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(mockEventTypes.getAll).toHaveBeenCalled();
        expect(mockEventTypes.getById).toHaveBeenCalled();
      });

      // The actual query keys are tested implicitly through cache invalidation
      // in the mutation tests above
    });
  });
});
