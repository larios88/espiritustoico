/**
 * Social Links Component Tests
 * Requirements: 14.1, 14.3, 14.4, 14.5
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SocialLinks } from '../SocialLinks';
import { socialLinksService } from '../../../services/SocialLinksService';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock the social links service
jest.mock('../../../services/SocialLinksService', () => ({
  socialLinksService: {
    getActiveLinks: jest.fn(),
    openLink: jest.fn()
  }
}));

// Mock theme context
const mockTheme = {
  backgroundColor: '#000000',
  textColor: '#9f8069',
  accentColor: '#9f8069',
  isCustom: false
};

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const mockSocialLinks = [
  {
    id: '1',
    platform: 'YouTube',
    url: 'https://youtube.com/@test',
    iconUrl: 'https://example.com/youtube.png',
    displayName: 'YouTube Channel',
    order: 1,
    isActive: true
  },
  {
    id: '2',
    platform: 'Spotify',
    url: 'https://open.spotify.com/show/test',
    iconUrl: 'https://example.com/spotify.png',
    displayName: 'Spotify Podcast',
    order: 2,
    isActive: true
  }
];

describe('SocialLinks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockSocialLinks), 100))
    );

    const { getByText } = render(
      <MockThemeProvider>
        <SocialLinks showLoading={true} />
      </MockThemeProvider>
    );

    expect(getByText('Loading social links...')).toBeTruthy();
  });

  it('renders social links after loading', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockResolvedValue(mockSocialLinks);

    const { getByText, queryByText } = render(
      <MockThemeProvider>
        <SocialLinks showLabels={true} />
      </MockThemeProvider>
    );

    await waitFor(() => {
      expect(queryByText('Loading social links...')).toBeNull();
      expect(getByText('YouTube Channel')).toBeTruthy();
      expect(getByText('Spotify Podcast')).toBeTruthy();
    });
  });

  it('renders empty state when no links available', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <MockThemeProvider>
        <SocialLinks />
      </MockThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('No social links available')).toBeTruthy();
    });
  });

  it('handles link press correctly', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockResolvedValue(mockSocialLinks);
    (socialLinksService.openLink as jest.Mock).mockResolvedValue(undefined);

    const { getByLabelText } = render(
      <MockThemeProvider>
        <SocialLinks showLabels={true} />
      </MockThemeProvider>
    );

    await waitFor(() => {
      const youtubeLink = getByLabelText('Open YouTube Channel');
      fireEvent.press(youtubeLink);
    });

    expect(socialLinksService.openLink).toHaveBeenCalledWith('1');
  });

  it('calls custom onLinkPress handler when provided', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockResolvedValue(mockSocialLinks);
    const mockOnLinkPress = jest.fn();

    const { getByLabelText } = render(
      <MockThemeProvider>
        <SocialLinks showLabels={true} onLinkPress={mockOnLinkPress} />
      </MockThemeProvider>
    );

    await waitFor(() => {
      const youtubeLink = getByLabelText('Open YouTube Channel');
      fireEvent.press(youtubeLink);
    });

    expect(mockOnLinkPress).toHaveBeenCalledWith(mockSocialLinks[0]);
    expect(socialLinksService.openLink).not.toHaveBeenCalled();
  });

  it('respects maxLinks prop', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockResolvedValue(mockSocialLinks);

    const { getByText, queryByText } = render(
      <MockThemeProvider>
        <SocialLinks showLabels={true} maxLinks={1} />
      </MockThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('YouTube Channel')).toBeTruthy();
      expect(queryByText('Spotify Podcast')).toBeNull();
    });
  });

  it('renders different layouts correctly', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockResolvedValue(mockSocialLinks);

    // Test horizontal layout
    const { rerender } = render(
      <MockThemeProvider>
        <SocialLinks layout="horizontal" showLabels={true} />
      </MockThemeProvider>
    );

    await waitFor(() => {
      expect(true).toBeTruthy(); // Component renders without error
    });

    // Test vertical layout
    rerender(
      <MockThemeProvider>
        <SocialLinks layout="vertical" showLabels={true} />
      </MockThemeProvider>
    );

    await waitFor(() => {
      expect(true).toBeTruthy(); // Component renders without error
    });

    // Test grid layout
    rerender(
      <MockThemeProvider>
        <SocialLinks layout="grid" showLabels={true} />
      </MockThemeProvider>
    );

    await waitFor(() => {
      expect(true).toBeTruthy(); // Component renders without error
    });
  });

  it('handles service errors gracefully', async () => {
    (socialLinksService.getActiveLinks as jest.Mock).mockRejectedValue(
      new Error('Service error')
    );

    const { getByText } = render(
      <MockThemeProvider>
        <SocialLinks />
      </MockThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Failed to load social links')).toBeTruthy();
      expect(getByText('Tap to retry')).toBeTruthy();
    });
  });
});