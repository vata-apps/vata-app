import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { Dialog } from './dialog';

const meta = {
  title: 'UI/Dialog',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled Base UI Dialog assembly — grayscale backdrop + popup shell. ' +
          'Width, padding and internal layout are the caller’s. Pass `layer="alert"` ' +
          'to Backdrop and Popup for a confirmation opened from an already-open dialog.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

/** A top-level modal — `layer="dialog"` (the default). */
export const Default: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button>Edit person</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup style={{ width: 360, padding: 20 }}>
          <Dialog.Title style={{ margin: '0 0 8px', fontSize: 16 }}>Edit person</Dialog.Title>
          <Dialog.Description style={{ margin: 0 }}>
            Change the recorded name, dates and notes for this individual.
          </Dialog.Description>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Dialog.Close render={<Button variant="ghost">Cancel</Button>} />
            <Dialog.Close render={<Button>Save</Button>} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};

/** A confirmation stacked above another dialog — `layer="alert"` on both parts. */
export const AlertLayer: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="danger">Discard draft</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop layer="alert" />
        <Dialog.Popup layer="alert" style={{ width: 320, padding: 20 }}>
          <Dialog.Title style={{ margin: '0 0 8px', fontSize: 16 }}>
            Discard this draft?
          </Dialog.Title>
          <Dialog.Description style={{ margin: 0 }}>
            The unsaved name and dates will be lost.
          </Dialog.Description>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <Dialog.Close render={<Button variant="ghost">Keep editing</Button>} />
            <Dialog.Close render={<Button variant="danger">Discard</Button>} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  ),
};
