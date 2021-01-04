import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddDeviceForm from './AddDeviceForm';

describe('<AddDeviceForm />', () => {
  test('it should mount', () => {
    render(<AddDeviceForm />);
    
    const addDeviceForm = screen.getByTestId('AddDeviceForm');

    expect(addDeviceForm).toBeInTheDocument();
  });
});