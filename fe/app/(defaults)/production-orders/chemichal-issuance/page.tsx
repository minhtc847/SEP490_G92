import ComponentsChemicalIssuance from '@/components/apps/production-orders/components-chemical-issuance';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'ChemicalIssuance',
};

const ChemicalIssuance = () => {
    return <ComponentsChemicalIssuance />;
};

export default ChemicalIssuance;
