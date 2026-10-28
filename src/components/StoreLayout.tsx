import React from 'react';
import { GalaxyBackground } from './GalaxyBackground';
import { StoreHeader } from './StoreHeader';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { OrderModal } from './OrderModal';
import { InfoModal } from './InfoModal';

export const StoreLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <GalaxyBackground />
      <StoreHeader />
      <main>{children}</main>
      <Footer />
      <BackToTop />
      <OrderModal />
      <InfoModal />
    </>
  );
};
