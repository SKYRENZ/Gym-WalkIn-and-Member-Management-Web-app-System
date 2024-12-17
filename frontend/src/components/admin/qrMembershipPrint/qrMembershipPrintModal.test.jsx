import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import QrMembershipPrintModal from './qrMembershipPrintModal';

test('renders QrMembershipPrintModal and fetches members', async () => {
  // Mock the fetch API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([{ name: 'John Doe' }, { name: 'Jane Smith' }]),
    })
  );

  render(<QrMembershipPrintModal isOpen={true} onClose={() => {}} />);

  // Check if the modal header is rendered
  expect(screen.getByText('Qr Membership Print')).toBeInTheDocument();

  // Check if the members are fetched and displayed
  const memberItems = await screen.findAllByRole('listitem');
  expect(memberItems).toHaveLength(2);
  expect(memberItems[0]).toHaveTextContent('John Doe');
  expect(memberItems[1]).toHaveTextContent('Jane Smith');
});