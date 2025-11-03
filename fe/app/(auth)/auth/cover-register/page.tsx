import ComponentsAuthRegisterForm from '@/components/auth/components-auth-register-form';
import IconFacebookCircle from '@/components/icon/icon-facebook-circle';
import IconGoogle from '@/components/icon/icon-google';
import IconInstagram from '@/components/icon/icon-instagram';
import IconTwitter from '@/components/icon/icon-twitter';
import LanguageDropdown from '@/components/language-dropdown';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Register Cover',
};

const CoverRegister = () => {
    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen justify-center bg-[linear-gradient(0deg,rgba(0,0,0,0.01),rgba(0,0,0,0.05),rgba(0,0,0,0.1))] px-4 py-16 sm:flex-row sm:items-center sm:justify-center sm:px-6 lg:px-8 xl:px-10 2xl:px-[17rem]">
                <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
                    <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
                        <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
                        <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                            <Link href="/" className="ms-10 block w-48 lg:w-72">
                                <img src="/assets/images/auth/logo-white.svg" alt="Logo" className="w-full" />
                            </Link>
                            <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                                <img src="/assets/images/auth/register.svg" alt="Cover Image" className="w-full" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
                        <Link href="/" className="block w-8 lg:hidden">
                            <img src="/assets/images/logo.svg" alt="Logo" className="mx-auto w-10" />
                        </Link>
                        <LanguageDropdown className="ms-auto w-max" />
                    </div>
                    <div className="w-full max-w-[440px] lg:mt-16">
                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Đăng ký</h1>
                            <p className="text-base font-bold leading-normal text-white-dark">Tạo tài khoản mới để bắt đầu</p>
                        </div>
                        <ComponentsAuthRegisterForm />

                        <div className="relative my-7 text-center md:mb-9">
                            <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                            <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">hoặc</span>
                        </div>

                        <div className="mb-10 md:mb-[60px]">
                            <ul className="flex justify-center gap-3.5 text-white-dark">
                                <li>
                                    <Link
                                        href="#"
                                        className="flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:bg-white-light/20 hover:text-primary dark:hover:bg-dark-light/20"
                                    >
                                        <IconFacebookCircle />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:bg-white-light/20 hover:text-primary dark:hover:bg-dark-light/20"
                                    >
                                        <IconTwitter />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:bg-white-light/20 hover:text-primary dark:hover:bg-dark-light/20"
                                    >
                                        <IconInstagram />
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:bg-white-light/20 hover:text-primary dark:hover:bg-dark-light/20"
                                    >
                                        <IconGoogle />
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <p className="text-center text-white-dark dark:text-white-light">
                            Đã có tài khoản?{' '}
                            <Link href="/auth/cover-login" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverRegister;
