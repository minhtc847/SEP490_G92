'use client';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconMultipleForwardRight from '@/components/icon/icon-multiple-forward-right';
import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import { IRootState } from '@/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';

const ComponentsDashboardSales = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    //Revenue Chart
    const revenueChart: any = {
        series: [
            {
                name: 'Income',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
            {
                name: 'Expenses',
                data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000],
            },
        ],
        options: {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            colors: isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1B55E2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#E7515A',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    offsetX: isRtl ? 2 : 0,
                    offsetY: 5,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value / 1000 + 'K';
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                opposite: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    show: false,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    };

    //Total Orders
    const totalOrders: any = {
        series: [
            {
                name: 'Sales',
                data: [28, 40, 36, 52, 38, 60, 38, 52, 36, 40],
            },
        ],
        options: {
            chart: {
                height: 290,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            colors: isDark ? ['#00ab55'] : ['#00ab55'],
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            yaxis: {
                min: 0,
                show: false,
            },
            grid: {
                padding: {
                    top: 125,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            fill: {
                opacity: 1,
                type: 'gradient',
                gradient: {
                    type: 'vertical',
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: 0.3,
                    opacityTo: 0.05,
                    stops: [100, 100],
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
            },
        },
    };

    return (
        <>
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Sales</span>
                    </li>
                </ul>

                <div className="pt-5">
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        <div className="panel h-full xl:col-span-2">
                            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                                <h5 className="text-lg font-semibold">Revenue</h5>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 1]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}
                                    >
                                        <ul>
                                            <li>
                                                <button type="button">Weekly</button>
                                            </li>
                                            <li>
                                                <button type="button">Monthly</button>
                                            </li>
                                            <li>
                                                <button type="button">Yearly</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <p className="text-lg dark:text-white-light/90">
                                Total Profit <span className="ml-2 text-primary">$10,840</span>
                            </p>
                            <div className="relative">
                                <div className="rounded-lg bg-white dark:bg-black">
                                    {isMounted ? (
                                        <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width={'100%'} />
                                    ) : (
                                        <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                            <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="panel h-full p-0">
                            <div className="absolute flex w-full items-center justify-between p-5">
                                <div className="relative">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success-light text-success dark:bg-success dark:text-success-light">
                                        <IconShoppingCart />
                                    </div>
                                </div>
                                <h5 className="text-2xl font-semibold ltr:text-right rtl:text-left dark:text-white-light">
                                    3,192
                                    <span className="block text-sm font-normal">Total Orders</span>
                                </h5>
                            </div>
                            <div className="rounded-lg bg-transparent">
                                {/* loader */}
                                {isMounted ? (
                                    <ReactApexChart series={totalOrders.series} options={totalOrders.options} type="area" height={290} width={'100%'} />
                                ) : (
                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"> */}
                        <div className="panel h-full w-full">
                            <div className="mb-5 flex items-center justify-between">
                                <h5 className="text-lg font-semibold dark:text-white-light">Recent Orders</h5>
                            </div>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="ltr:rounded-l-md rtl:rounded-r-md">Customer</th>
                                            <th>Product</th>
                                            <th>Invoice</th>
                                            <th>Price</th>
                                            <th className="ltr:rounded-r-md rtl:rounded-l-md">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="min-w-[150px] text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/profile-6.jpeg" alt="avatar" />
                                                    <span className="whitespace-nowrap">Luke Ivory</span>
                                                </div>
                                            </td>
                                            <td className="text-primary">Headphone</td>
                                            <td>
                                                <Link href="/apps/invoice/preview">#46894</Link>
                                            </td>
                                            <td>$56.07</td>
                                            <td>
                                                <span className="badge bg-success shadow-md dark:group-hover:bg-transparent">Paid</span>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/profile-7.jpeg" alt="avatar" />
                                                    <span className="whitespace-nowrap">Andy King</span>
                                                </div>
                                            </td>
                                            <td className="text-info">Nike Sport</td>
                                            <td>
                                                <Link href="/apps/invoice/preview">#76894</Link>
                                            </td>
                                            <td>$126.04</td>
                                            <td>
                                                <span className="badge bg-secondary shadow-md dark:group-hover:bg-transparent">Shipped</span>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/profile-8.jpeg" alt="avatar" />
                                                    <span className="whitespace-nowrap">Laurie Fox</span>
                                                </div>
                                            </td>
                                            <td className="text-warning">Sunglasses</td>
                                            <td>
                                                <Link href="/apps/invoice/preview">#66894</Link>
                                            </td>
                                            <td>$56.07</td>
                                            <td>
                                                <span className="badge bg-success shadow-md dark:group-hover:bg-transparent">Paid</span>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/profile-9.jpeg" alt="avatar" />
                                                    <span className="whitespace-nowrap">Ryan Collins</span>
                                                </div>
                                            </td>
                                            <td className="text-danger">Sport</td>
                                            <td>
                                                <button type="button">#75844</button>
                                            </td>
                                            <td>$110.00</td>
                                            <td>
                                                <span className="badge bg-secondary shadow-md dark:group-hover:bg-transparent">Shipped</span>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/profile-10.jpeg" alt="avatar" />
                                                    <span className="whitespace-nowrap">Irene Collins</span>
                                                </div>
                                            </td>
                                            <td className="text-secondary">Speakers</td>
                                            <td>
                                                <Link href="/apps/invoice/preview">#46894</Link>
                                            </td>
                                            <td>$56.07</td>
                                            <td>
                                                <span className="badge bg-success shadow-md dark:group-hover:bg-transparent">Paid</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <br />

                        <div className="panel h-full w-full">
                            <div className="mb-5 flex items-center justify-between">
                                <h5 className="text-lg font-semibold dark:text-white-light">Top Selling Product</h5>
                            </div>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr className="border-b-0">
                                            <th className="ltr:rounded-l-md rtl:rounded-r-md">Product</th>
                                            <th>Price</th>
                                            <th>Discount</th>
                                            <th>Sold</th>
                                            <th className="ltr:rounded-r-md rtl:rounded-l-md">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="min-w-[150px] text-black dark:text-white">
                                                <div className="flex">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/product-headphones.jpg" alt="avatar" />
                                                    <p className="whitespace-nowrap">
                                                        Headphone
                                                        <span className="block text-xs text-primary">Digital</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td>$168.09</td>
                                            <td>$60.09</td>
                                            <td>170</td>
                                            <td>
                                                <button type="button" className="flex items-center text-danger">
                                                    <IconMultipleForwardRight className="ltr:mr-1 rtl:ml-1 rtl:rotate-180" />
                                                    Direct
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/product-shoes.jpg" alt="avatar" />
                                                    <p className="whitespace-nowrap">
                                                        Shoes <span className="block text-xs text-warning">Faishon</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td>$126.04</td>
                                            <td>$47.09</td>
                                            <td>130</td>
                                            <td>
                                                <button type="button" className="flex items-center text-success">
                                                    <IconMultipleForwardRight className="ltr:mr-1 rtl:ml-1 rtl:rotate-180" />
                                                    Google
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/product-watch.jpg" alt="avatar" />
                                                    <p className="whitespace-nowrap">
                                                        Watch <span className="block text-xs text-danger">Accessories</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td>$56.07</td>
                                            <td>$20.00</td>
                                            <td>66</td>
                                            <td>
                                                <button type="button" className="flex items-center text-warning">
                                                    <IconMultipleForwardRight className="ltr:mr-1 rtl:ml-1 rtl:rotate-180" />
                                                    Ads
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/product-laptop.jpg" alt="avatar" />
                                                    <p className="whitespace-nowrap">
                                                        Laptop <span className="block text-xs text-primary">Digital</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td>$110.00</td>
                                            <td>$33.00</td>
                                            <td>35</td>
                                            <td>
                                                <button type="button" className="flex items-center text-secondary">
                                                    <IconMultipleForwardRight className="ltr:mr-1 rtl:ml-1 rtl:rotate-180" />
                                                    Email
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                            <td className="text-black dark:text-white">
                                                <div className="flex">
                                                    <img className="h-8 w-8 rounded-md object-cover ltr:mr-3 rtl:ml-3" src="/assets/images/product-camera.jpg" alt="avatar" />
                                                    <p className="whitespace-nowrap">
                                                        Camera <span className="block text-xs text-primary">Digital</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td>$56.07</td>
                                            <td>$26.04</td>
                                            <td>30</td>
                                            <td>
                                                <button type="button" className="flex items-center text-primary">
                                                    <IconMultipleForwardRight className="ltr:mr-1 rtl:ml-1 rtl:rotate-180" />
                                                    Referral
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/* </div> */}
                </div>
            </div>
        </>
    );
};

export default ComponentsDashboardSales;
