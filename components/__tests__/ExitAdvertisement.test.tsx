import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ExitAdvertisement from '../ExitAdvertisement';
import { ExitAdConfig } from '../../models/Advertisement';

const mockExitAdConfig: ExitAdConfig = {
  id: 'test-exit-ad',
  type: 'exit',
  content: 'Test advertisement content',
  skipAfter: 5,
  borderConfig: {
    top: { width: 2, color: '#4ecdc4', style: 'solid' },
    right: { width: 2, color: '#4ecdc4', style: 'solid' },
    bottom: { width: 2, color: '#4ecdc4', style: 'solid' },
    left: { width: 2, color: '#4ecdc4', style: 'solid' },
  },
  isActive: true,
};

describe('ExitAdvertisement', () => {
  const mockProps = {
    adConfig: mockExitAdConfig,
    isVisible: true,
    onAdComplete: jest.fn(),
    onAdSkip: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders advertisement content correctly', () => {
    const { getByText } = render(<ExitAdvertisement {...mockProps} />);
    
    expect(getByText('Test advertisement content')).toBeTruthy();
    expect(getByText('Skip available in 5 seconds')).toBeTruthy();
  });

  it('shows skip button after 5 seconds', async () => {
    const { getByText, queryByText } = render(<ExitAdvertisement {...mockProps} />);
    
    // Initially skip button should not be visible
    expect(queryByText('Skip Ad')).toBeNull();
    
    // Fast forward 5 seconds
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(getByText('Skip Ad')).toBeTruthy();
      expect(getByText('Continue')).toBeTruthy();
    });
  });

  it('calls onAdSkip when skip button is pressed', async () => {
    const { getByText } = render(<ExitAdvertisement {...mockProps} />);
    
    // Fast forward to make skip button available
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      const skipButton = getByText('Skip Ad');
      fireEvent.press(skipButton);
      expect(mockProps.onAdSkip).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onAdComplete when continue button is pressed', async () => {
    const { getByText } = render(<ExitAdvertisement {...mockProps} />);
    
    // Fast forward to make continue button available
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);
      expect(mockProps.onAdComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByLabelText } = render(<ExitAdvertisement {...mockProps} />);
    
    const cancelButton = getByLabelText('Cancel app closure');
    fireEvent.press(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render when isVisible is false', () => {
    const { queryByText } = render(
      <ExitAdvertisement {...mockProps} isVisible={false} />
    );
    
    expect(queryByText('Test advertisement content')).toBeNull();
  });

  it('does not render when adConfig is undefined', () => {
    const { queryByText } = render(
      <ExitAdvertisement {...mockProps} adConfig={undefined} />
    );
    
    expect(queryByText('Test advertisement content')).toBeNull();
  });

  it('updates timer countdown correctly', async () => {
    const { getByText } = render(<ExitAdvertisement {...mockProps} />);
    
    expect(getByText('Skip available in 5 seconds')).toBeTruthy();
    
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(getByText('Skip available in 4 seconds')).toBeTruthy();
    });
    
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(getByText('Skip available in 3 seconds')).toBeTruthy();
    });
  });
});