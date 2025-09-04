import { Tabs } from "@mantine/core";
import {
  IconBook,
  IconCalendar,
  IconNotes,
  IconPhoto,
} from "@tabler/icons-react";
import TabDetails from "./tabs/TabDetails";
import TabEvents from "./tabs/TabEvents";
import TabMedias from "./tabs/TabMedias";
import TabSources from "./tabs/TabSources";

export function PlaceTabs() {
  return (
    <Tabs variant="default" defaultValue="details" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="details" leftSection={<IconNotes size={12} />}>
          Details
        </Tabs.Tab>
        <Tabs.Tab value="events" leftSection={<IconCalendar size={12} />}>
          Events
        </Tabs.Tab>
        <Tabs.Tab value="medias" leftSection={<IconPhoto size={12} />}>
          Medias
        </Tabs.Tab>
        <Tabs.Tab value="sources" leftSection={<IconBook size={12} />}>
          Sources
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel pt="lg" value="details">
        <TabDetails />
      </Tabs.Panel>
      <Tabs.Panel pt="lg" value="events">
        <TabEvents />
      </Tabs.Panel>
      <Tabs.Panel pt="lg" value="medias">
        <TabMedias />
      </Tabs.Panel>
      <Tabs.Panel pt="lg" value="sources">
        <TabSources />
      </Tabs.Panel>
    </Tabs>
  );
}
