import ComponentsGlueButylIssuance from '@/components/apps/production-orders/components-glue-butyl-issuance';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'GlueButylIssuance',
};

const GlueButylIssuance = () => {
    return <ComponentsGlueButylIssuance />;
};

export default GlueButylIssuance;
