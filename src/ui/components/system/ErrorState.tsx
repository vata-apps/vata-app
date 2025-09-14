import { Alert, Stack, Text, Code } from "@mantine/core";
import {
  IconAlertCircle,
  IconFileOff,
  IconServerOff,
  IconDatabaseOff,
} from "@tabler/icons-react";

export function ErrorState({ error }: { error: Error }) {
  const getErrorInfo = () => {
    const message = error.message.toLowerCase();

    if (message.includes("not_found") || message.includes("404")) {
      return {
        icon: IconFileOff,
        title: "Not Found",
        description: "The resource you're looking for doesn't exist.",
        color: "orange",
      };
    }

    if (message.includes("network") || message.includes("fetch")) {
      return {
        icon: IconServerOff,
        title: "Network Error",
        description:
          "Unable to connect. Please check your internet connection.",
        color: "red",
      };
    }

    if (message.includes("database") || message.includes("sql")) {
      return {
        icon: IconDatabaseOff,
        title: "Database Error",
        description: "There was a problem accessing the database.",
        color: "red",
      };
    }

    if (message.includes("permission") || message.includes("denied")) {
      return {
        icon: IconAlertCircle,
        title: "Permission Denied",
        description: "You don't have permission to perform this action.",
        color: "red",
      };
    }

    return {
      icon: IconAlertCircle,
      title: "Something went wrong",
      description: error.message || "An unexpected error occurred.",
      color: "red",
    };
  };

  const errorInfo = getErrorInfo();
  const Icon = errorInfo.icon;

  return (
    <Alert
      icon={<Icon size={24} />}
      title={errorInfo.title}
      color={errorInfo.color}
      variant="light"
    >
      <Stack gap="xs">
        <Text size="sm">{errorInfo.description}</Text>
        {import.meta.env.DEV && error.message !== errorInfo.description && (
          <Code block color="gray" style={{ fontSize: "12px" }}>
            {error.message}
          </Code>
        )}
      </Stack>
    </Alert>
  );
}
