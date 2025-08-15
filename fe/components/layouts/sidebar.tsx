'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuNotes from '@/components/icon/menu/icon-menu-notes';
import IconMenuScrumboard from '@/components/icon/menu/icon-menu-scrumboard';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuComponents from '@/components/icon/menu/icon-menu-components';
import IconMenuElements from '@/components/icon/menu/icon-menu-elements';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';
import IconMenuFontIcons from '@/components/icon/menu/icon-menu-font-icons';
import IconMenuDragAndDrop from '@/components/icon/menu/icon-menu-drag-and-drop';
import IconMenuTables from '@/components/icon/menu/icon-menu-tables';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import { usePermissions } from '@/hooks/usePermissions';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const { roleId, canView, canCreate, canEdit, canDelete, isFactoryManager, isAccountant, isProductionStaff } = usePermissions();

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    // Render menu items based on role
    const renderMenuItems = () => {
        const items = [];

        // Dashboard - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="dashboard" className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('dashboard')}>
                        <div className="flex items-center">
                            <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">{t('dashboard')}</span>
                        </div>
                        <div className={currentMenu !== 'dashboard' ? '-rotate-90 rtl:rotate-90' : ''}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                        <ul className="sub-menu text-gray-500">
                            <li>
                                <Link href="/">{t('sales')}</Link>
                            </li>
                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Orders - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="order" className="menu nav-item">
                    <button type="button" className={`${currentMenu === 'order' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('order')}>
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">Đơn Hàng</span>
                        </div>
                        <div className={currentMenu !== 'order' ? '-rotate-90 rtl:rotate-90' : ''}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === 'order' ? 'auto' : 0}>
                        <ul className="sub-menu text-gray-500">
                            <li>
                                <Link href="/sales-order">Đơn Bán</Link>
                            </li>
                            <li>
                                <Link href="/purchase-order">Đơn Mua</Link>
                            </li>

                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Invoices - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="invoices" className="menu nav-item">
                    <Link href="/invoices" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Hóa Đơn
                            </span>
                        </div>
                    </Link>
                </li>
            );
        }

        // Debts - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="debts" className="menu nav-item">
                    <Link href="/debts" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Công Nợ
                            </span>
                        </div>
                    </Link>
                </li>
            );
        }

        // Production - All roles can view
        items.push(
            <li key="production" className="menu nav-item">
                <button type="button" className={`${currentMenu === 'production' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('production')}>
                    <div className="flex items-center">
                        <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">Sản Xuất</span>
                    </div>
                    <div className={currentMenu !== 'production' ? '-rotate-90 rtl:rotate-90' : ''}>
                        <IconCaretDown />
                    </div>
                </button>
                <AnimateHeight duration={300} height={currentMenu === 'production' ? 'auto' : 0}>
                    <ul className="sub-menu text-gray-500">
                        <li>
                            <Link href="/production-plans">Kế hoạch sản xuất</Link>
                        </li>
                        <li>
                            <Link href="/production-orders">Các lệnh sản xuất</Link>
                        </li>
                    </ul>
                </AnimateHeight>
            </li>
        );


        // Employees - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="employees" className="menu nav-item">
                    <button type="button" className={`${currentMenu === "employees" ? "active" : ""} nav-link group w-full`} onClick={() => toggleMenu("employees")}>
                        <div className="flex items-center">
                            <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Nhân Viên
                            </span>
                        </div>
                        <div className={currentMenu !== "employees" ? "-rotate-90 rtl:rotate-90" : ""}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === "employees" ? "auto" : 0}>
                        <ul className="sub-menu text-gray-500">
                            <li>
                                <Link href="/employees">Danh Sách Nhân Viên</Link>
                            </li>

                            <li>
                                <Link href="/employees/create">Thêm Nhân Viên</Link>
                            </li>

                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Customers - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="customers" className="menu nav-item">
                    <button type="button" className={`${currentMenu === "customers" ? "active" : ""} nav-link group w-full`} onClick={() => toggleMenu("customers")}>
                        <div className="flex items-center">
                            <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Khách Hàng
                            </span>
                        </div>
                        <div className={currentMenu !== "customers" ? "-rotate-90 rtl:rotate-90" : ""}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === "customers" ? "auto" : 0}>
                        <ul className="sub-menu text-gray-500">
                            <li>
                                <Link href="/customers">Danh Sách Khách Hàng</Link>
                            </li>

                            <li>
                                <Link href="/customers/create">Thêm Khách Hàng</Link>
                            </li>

                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Account Management - Factory Manager only
        if (isFactoryManager()) {
            items.push(
                <li key="account-management" className="menu nav-item">
                    <button type="button" className={`${currentMenu === "account-management" ? "active" : ""} nav-link group w-full`} onClick={() => toggleMenu("account-management")}>
                        <div className="flex items-center">
                            <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Quản Lý Tài Khoản
                            </span>
                        </div>
                        <div className={currentMenu !== "account-management" ? "-rotate-90 rtl:rotate-90" : ""}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === "account-management" ? "auto" : 0}>
                        <ul className="sub-menu text-gray-500">
                            <li>
                                <Link href="/account-management">Danh Sách Tài Khoản</Link>
                            </li>
                            <li>
                                <Link href="/account-management/create">Tạo Tài Khoản</Link>
                            </li>
                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Products - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="products" className="menu nav-item">
                    <button type="button" className={`${currentMenu === "products" ? "active" : ""} nav-link group w-full`} onClick={() => toggleMenu("products")}>
                        <div className="flex items-center">
                            <IconMenuComponents className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Sản Phẩm
                            </span>
                        </div>
                        <div className={currentMenu !== "products" ? "-rotate-90 rtl:rotate-90" : ""}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === "products" ? "auto" : 0}>
                        <ul className="sub-menu text-gray-500">
                            <li>
                                <Link href="/products">Danh Sách Sản Phẩm</Link>
                            </li>

                            <li>
                                <Link href="/products/create">Thêm Sản Phẩm</Link>
                            </li>

                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Price Quotes and delivery - Factory Manager and Accountant
        if (isFactoryManager() || isAccountant()) {
            items.push(
                <li key="quotes" className="menu nav-item">
                    <Link href="/price-quotes" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Báo Giá
                            </span>
                        </div>
                    </Link>
                </li>
            );
            items.push(
                <li key="delivery" className="menu nav-item">
                    <Link href="/delivery" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Giao hàng
                            </span>
                        </div>
                    </Link>
                </li>
            );
            items.push(
                <li key="zalo-orders" className="menu nav-item">
                    <Link href="/zalo-orders" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Đơn Hàng Zalo
                            </span>
                        </div>
                    </Link>
                </li>
            );
        }

        // Glue Management - All roles can view

        items.push(
            <li key="glue" className="menu nav-item">
                <Link href="/glue-formula" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Quản Lý Keo
                            </span>
                        </div>
                    </Link>
            </li>
        );

        // Inventory Slip Management - Production Staff, Factory Manager, and Accountant
        if (isProductionStaff() || isFactoryManager() || isAccountant()) {
            items.push(
                <li key="inventoryslip" className="menu nav-item">
                    <Link href="/inventoryslip" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Phiếu Kho
                            </span>
                        </div>
                    </Link>
                </li>
            );
        }

        // Document Management - Factory Manager 
        // if (isFactoryManager() ) {
        //     items.push(
        //         <li key="materials" className="menu nav-item">
        //             <Link href="/materials-chat" className="nav-link group w-full">
        //                 <div className="flex items-center">
        //                     <IconMenuChat className="shrink-0 group-hover:!text-primary" />
        //                     <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
        //                         Tài Liệu Chatbot
        //                     </span>
        //                 </div>
        //             </Link>
        //         </li>
        //     );
        // }

        // // Chat - All roles can view
        // items.push(
        //     <li key="chat" className="menu nav-item">
        //         <Link href="/chat" className="nav-link group w-full">
        //             <div className="flex items-center">
        //                 <IconMenuChat className="shrink-0 group-hover:!text-primary" />
        //                 <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
        //                     Chat
        //                 </span>
        //             </div>
        //         </Link>
        //     </li>
        // );

         return items;
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">VNG</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            {renderMenuItems()}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;