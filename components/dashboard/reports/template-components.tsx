'use client';

import React from 'react';
import {
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
  PhotoIcon,
  PencilSquareIcon,
  QrCodeIcon,
  HashtagIcon, 
  MapPinIcon,
  CloudIcon,
  ChartPieIcon,
  TruckIcon,
  ArrowTrendingUpIcon, 
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';

export const HeaderComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <DocumentTextIcon className="w-full h-full" />
  </div>
);

export const FooterComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <DocumentTextIcon className="w-full h-full" />
  </div>
);

export const TableComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <TableCellsIcon className="w-full h-full" />
  </div>
);

export const ChartComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <ChartBarIcon className="w-full h-full" />
  </div>
);

export const ImageComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <PhotoIcon className="w-full h-full" />
  </div>
);

export const TextComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <DocumentTextIcon className="w-full h-full" />
  </div>
);

export const SignatureComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <PencilSquareIcon className="w-full h-full" />
  </div>
);

export const QRCodeComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <QrCodeIcon className="w-full h-full" />
  </div>
);

export const BarcodeComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <HashtagIcon className="w-full h-full" />
  </div>
);

export const MapComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <MapPinIcon className="w-full h-full" />
  </div>
);

export const WeatherWidget: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <CloudIcon className="w-full h-full" />
  </div>
);

export const CatchSummaryComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <ChartPieIcon className="w-full h-full" />
  </div>
);

export const VesselStatsComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <TruckIcon className="w-full h-full" />
  </div>
);

export const QuotaProgressComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <ArrowTrendingUpIcon className="w-full h-full" />
  </div>
);

export const TimelineComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <ClockIcon className="w-full h-full" />
  </div>
);

export const AnnotationsComponent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <ChatBubbleBottomCenterTextIcon className="w-full h-full" />
  </div>
);
