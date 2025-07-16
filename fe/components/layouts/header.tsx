"use client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import type { IRootState } from "@/store"
import { toggleSidebar, toggleRTL } from "@/store/themeConfigSlice"
import Dropdown from "@/components/dropdown"
import IconMenu from "@/components/icon/icon-menu"
import IconSearch from "@/components/icon/icon-search"
import IconXCircle from "@/components/icon/icon-x-circle"
import IconInfoCircle from "@/components/icon/icon-info-circle"
import IconBellBing from "@/components/icon/icon-bell-bing"
import IconLogout from "@/components/icon/icon-logout"
import { usePathname, useRouter } from "next/navigation"
import { getTranslation } from "@/i18n"
import { logout, selectUser } from "@/store/authSlice"
import * as signalR from "@microsoft/signalr"

type NotificationItem = {
  id: number
  profile: string
  message: string
  time: string
}

const Header = () => {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()
  const { t, i18n } = getTranslation()
  const user = useSelector(selectUser)

  useEffect(() => {
  console.log("Attempting to establish SignalR connection...");

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7075/saleOrderHub")
    .withAutomaticReconnect()
    .build();

  connection.on("SaleOrderCreated", (data) => {
    console.log("📦 SaleOrderCreated event received:", data);

    const newNotification = {
      id: Date.now(),
      profile: "user-profile.jpeg",
      message: `<strong>${data.message}</strong> — mã: <strong>${data.orderCode}</strong>`,
      time: data.createAt || "Vừa xong",
    };

    addNotification(newNotification); // ✅ Dùng hàm addNotification đã có
  });

  connection
    .start()
    .then(() => console.log("✅ Connected to SaleOrder SignalR Hub"))
    .catch((err) => console.error("❌ SaleOrder SignalR Connection Error:", err));

  return () => {
    connection.stop();
  };
}, []);


  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl"
  const themeConfig = useSelector((state: IRootState) => state.themeConfig)

  const setLocale = (flag: string) => {
    if (flag.toLowerCase() === "ae") {
      dispatch(toggleRTL("rtl"))
    } else {
      dispatch(toggleRTL("ltr"))
    }
    router.refresh()
  }

  function createMarkup(messages: any) {
    return { __html: messages }
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      image:
        '<span class="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>',
      title: "Congratulations!",
      message: "Your OS has been updated.",
      time: "1hr",
    },
    {
      id: 2,
      image:
        '<span class="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>',
      title: "Did you know?",
      message: "You can switch between artboards.",
      time: "2hr",
    },
    {
      id: 3,
      image:
        '<span class="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>',
      title: "Something went wrong!",
      message: "Send Reposrt",
      time: "2days",
    },
    {
      id: 4,
      image:
        '<span class="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">     <circle cx="12" cy="12" r="10"></circle>     <line x1="12" y1="8" x2="12" y2="12"></line>     <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>',
      title: "Warning",
      message: "Your password strength is low.",
      time: "5days",
    },
  ])

  const removeMessage = (value: number) => {
    setMessages(messages.filter((user) => user.id !== value))
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications")
      return saved ? (JSON.parse(saved) as NotificationItem[]) : []
    }
    return []
  })

  const addNotification = (notification: NotificationItem) => {
  setNotifications((prev) => {
    const updated = [notification, ...prev].slice(0, 10); 
    localStorage.setItem("notifications", JSON.stringify(updated));
    return updated;
  });
};


  const removeNotification = (value: number) => {
    const updated = notifications.filter((n) => n.id !== value)
    setNotifications(updated)
    localStorage.setItem("notifications", JSON.stringify(updated))
  }

  const [search, setSearch] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    router.push("/auth/cover-login")
  }

  return (
    <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === "horizontal" ? "dark" : ""}`}>
      <div className="shadow-sm">
        <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
          <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
            <Link href="/" className="main-logo flex shrink-0 items-center">
              <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.svg" alt="logo" />
              <span className="hidden align-middle text-2xl font-semibold transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">
                VNG
              </span>
            </Link>
            <button
              type="button"
              className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>
          <div className="hidden ltr:mr-2 rtl:ml-2 sm:block">
            <ul className="flex items-center space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
              {/*<li>*/}
              {/*    <Link href="/apps/todolist" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">*/}
              {/*        <IconEdit />*/}
              {/*    </Link>*/}
              {/*</li>*/}
              {/*<li>*/}
              {/*    <Link href="/apps/chat" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">*/}
              {/*        <IconChatNotification />*/}
              {/*    </Link>*/}
              {/*</li>*/}
            </ul>
          </div>

          <div className="flex items-center space-x-1.5 ltr:ml-auto rtl:mr-auto rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 ltr:sm:ml-0 sm:rtl:mr-0 lg:space-x-2">
            <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
              <button
                type="button"
                onClick={() => setSearch(!search)}
                className="search_btn rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 dark:bg-dark/40 dark:hover:bg-dark/60 sm:hidden"
              >
                <IconSearch className="mx-auto h-4.5 w-4.5 dark:text-[#d0d2d6]" />
              </button>
            </div>
            <div className="dropdown shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                button={
                  <span>
                    <IconBellBing />
                    <span className="absolute top-0 flex h-3 w-3 ltr:right-0 rtl:left-0">
                      <span className="absolute -top-[3px] inline-flex h-full w-full animate-ping rounded-full bg-success/50 opacity-75 ltr:-left-[3px] rtl:-right-[3px]"></span>
                      <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-success"></span>
                    </span>
                  </span>
                }
              >
                <ul className="w-[300px] divide-y !py-0 text-dark dark:divide-white/10 dark:text-white-dark sm:w-[350px]">
                  <li onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-4 py-2 font-semibold">
                      <h4 className="text-lg">Notification</h4>
                      {notifications.length ? (
                        <span className="badge bg-primary/80">{notifications.length} New</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </li>
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => {
                        return (
                          <li
                            key={notification.id}
                            className="dark:text-white-light/90"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="group flex items-center px-4 py-2">
                              <div className="grid place-content-center rounded">
                                <div className="relative h-12 w-12">
                                  <img
                                    className="h-12 w-12 rounded-full object-cover"
                                    alt="profile"
                                    src={`/assets/images/${notification.profile}`}
                                  />
                                  <span className="absolute bottom-0 right-[6px] block h-2 w-2 rounded-full bg-success"></span>
                                </div>
                              </div>
                              <div className="flex flex-auto ltr:pl-3 rtl:pr-3">
                                <div className="ltr:pr-3 rtl:pl-3">
                                  <h6
                                    dangerouslySetInnerHTML={{
                                      __html: notification.message,
                                    }}
                                  ></h6>
                                  <span className="block text-xs font-normal dark:text-gray-500">
                                    {notification.time}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="text-neutral-300 opacity-0 hover:text-danger group-hover:opacity-100 ltr:ml-auto rtl:mr-auto"
                                  onClick={() => removeNotification(notification.id)}
                                >
                                  <IconXCircle />
                                </button>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                      <li>
                        <div className="p-4">
                          <button className="btn btn-primary btn-small block w-full">Read All Notifications</button>
                        </div>
                      </li>
                    </>
                  ) : (
                    <li onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent"
                      >
                        <div className="mx-auto mb-4 rounded-full ring-4 ring-primary/30">
                          <IconInfoCircle fill={true} className="h-10 w-10 text-primary" />
                        </div>
                        No data available.
                      </button>
                    </li>
                  )}
                </ul>
              </Dropdown>
            </div>
            <div className="dropdown flex shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                btnClassName="relative group block"
                button={
                  <img
                    className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100"
                    src="/assets/images/user-profile.jpeg"
                    alt="userProfile"
                  />
                }
              >
                <ul className="w-[230px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                  <li>
                    <div className="flex items-center px-4 py-4">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src="/assets/images/user-profile.jpeg"
                        alt="userProfile"
                      />
                      <div className="truncate ltr:pl-4 rtl:pr-4">
                        <h4 className="text-base font-bold">
                          {user?.employeeName || user?.username || "Chưa đăng nhập"}
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user?.roleName}</div>
                        {user?.username && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.username}</div>
                        )}
                      </div>
                    </div>
                  </li>
                  <li className="border-t border-white-light dark:border-white-light/10">
                    <button onClick={handleLogout} className="!py-3 text-danger flex items-center w-full px-4">
                      <IconLogout className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
