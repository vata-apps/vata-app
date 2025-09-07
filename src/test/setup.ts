import { beforeEach } from "vitest";
import { mockDatabase, mockUuid, mockFs } from "./mocks";

beforeEach(() => {
  mockDatabase.execute.mockClear();
  mockDatabase.select.mockClear();
  mockDatabase.load.mockClear();
  mockDatabase.close.mockClear();

  mockUuid.v4.mockClear();
  mockUuid.v4.mockReturnValue("mock-uuid-1234");

  mockFs.exists.mockClear();
  mockFs.mkdir.mockClear();
  mockFs.remove.mockClear();
  mockFs.readDir.mockClear();

  const mockDatabaseInstance = {
    execute: mockDatabase.execute,
    select: mockDatabase.select,
    close: mockDatabase.close,
  };

  mockDatabase.load.mockResolvedValue(mockDatabaseInstance);
});
