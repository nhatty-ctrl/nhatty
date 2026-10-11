import React from 'react';
import { Campaign } from '../types/campaign';
import { ShareOverlayModal } from './ShareOverlayModal';

interface JoinedSuccessModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: (campaign: Campaign) => void;
  onViewCampaign: (id: string) => void;
}

export const JoinedSuccessModal: React.FC<JoinedSuccessModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onCopyLink,
  onViewCampaign,
}) => {
  return (
    <ShareOverlayModal
      campaign={campaign}
      isOpen={isOpen}
      onClose={onClose}
      onCopyLink={onCopyLink}
      onViewCampaign={onViewCampaign}
      layout="auto"
      initialTab="link"
    />
  );
};
