import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Sales Orders',
};

export default function Page() {
    redirect('/sales-order');
}
