import React from 'react';
import { Campaign } from '../types/campaign';
import { ShareOverlayModal } from './ShareOverlayModal';

interface QrCodeModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (c: Campaign) => void;
  onShare: (c: Campaign) => void;
  isFreshJoin?: boolean;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onCopy,
  onShare: _onShare,
  isFreshJoin = false,
}) => {
  return (
    <ShareOverlayModal
      campaign={campaign}
      isOpen={isOpen}
      onClose={onClose}
      onCopyLink={onCopy}
      onViewCampaign={(id) => {
        window.location.hash = `#/c/${id}`;
        onClose();
      }}
      layout="auto"
      initialTab={isFreshJoin ? 'link' : 'qr'}
    />
  );
};
