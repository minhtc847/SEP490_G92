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

        // Dashboard - All roles can view
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

        // Orders - All roles can view, Factory Manager can manage
        if (canView('orders')) {
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
                            {isFactoryManager() && (
                                <li>
                                    <Link href="/purchasing-units">Đơn Mua</Link>
                                </li>
                            )}
                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Production - Production Staff and Factory Manager
        if (canView('production')) {
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
        }

        // Customers - Factory Manager and Accountant
        if (canView('customers')) {
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
                            {canCreate('customers') && (
                                <li>
                                    <Link href="/customers/create">Thêm Khách Hàng</Link>
                                </li>
                            )}
                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Price Quotes - Factory Manager and Accountant
        if (canView('quotes')) {
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
        }

        // Glue Management - Factory Manager and Production Staff
        if (canView('glue')) {
            items.push(
                <li key="glue" className="menu nav-item">
                    <button type="button" className={`${currentMenu === "glue" ? "active" : ""} nav-link group w-full`} onClick={() => toggleMenu("glue")}>
                        <div className="flex items-center">
                            <IconMenuComponents className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Quản Lý Keo
                            </span>
                        </div>
                        <div className={currentMenu !== "glue" ? "-rotate-90 rtl:rotate-90" : ""}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === "glue" ? "auto" : 0}>
                        <ul className="sub-menu text-gray-500">
                            <li>
                                <Link href="/glue-formula">Công thức keo</Link>
                            </li>
                            <li>
                                <Link href="/glue-structure">Cấu trúc keo</Link>
                            </li>
                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

        // Messages - Factory Manager only
        if (canView('messages')) {
            items.push(
                <li key="messages" className="menu nav-item">
                    <Link href="/messages" className="nav-link group w-full">
                        <div className="flex items-center">
                            <IconMenuChat className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Tin Nhắn
                            </span>
                        </div>
                    </Link>
                </li>
            );
        }

        // User Management - Factory Manager only
        if (isFactoryManager()) {
            items.push(
                <li key="mockup" className="menu nav-item">
                    <button type="button" className={`${currentMenu === "mockup" ? "active" : ""} nav-link group w-full`} onClick={() => toggleMenu("mockup")}>
                        <div className="flex items-center">
                            <IconMenuComponents className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase font-extrabold">
                                Mockup
                            </span>
                        </div>
                        <div className={currentMenu !== "mockup" ? "-rotate-90 rtl:rotate-90" : ""}>
                            <IconCaretDown />
                        </div>
                    </button>
                    <AnimateHeight duration={300} height={currentMenu === "mockup" ? "auto" : 0}>
                        <ul className="sub-menu text-gray-500">
                           
                            <li>
                                <Link href="/mockup/worker/production-plans">Danh sách kế hoạch sản xuất - worker</Link>
                            </li>
                            <li>
                                <Link href="/mockup/manager/production-plans">Danh sách kế hoạch sản xuất - manager</Link>
                            </li>
                            <li>
                                <Link href="/mockup/accountant/production-plans">Danh sách kế hoạch sản xuất - accountant</Link>
                            </li>
                        </ul>
                    </AnimateHeight>
                </li>
            );
        }

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
