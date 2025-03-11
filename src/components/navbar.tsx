'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LoginButton } from './auth/login-button';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className='border-b border-border bg-white px-4 py-4 shadow-sm'>
      <div className='flex items-center space-x-6'>
        <Image
          src='/metadata-logo.svg'
          alt='Azure Metadata Manager Logo'
          width={90}
          height={90}
        />
        <Link
          href='/dashboard/documents'
          className={`pb-1 text-sm text-black transition-colors hover:text-primary ${
            isActive('/dashboard/documents') ? 'border-b-2 border-primary' : ''
          }`}
        >
          Document number
        </Link>
        <Link
          href='/dashboard/projects'
          className={`pb-1 text-sm text-black transition-colors hover:text-primary ${
            isActive('/dashboard/projects') ? 'border-b-2 border-primary' : ''
          }`}
        >
          Projects
        </Link>
        <LoginButton />
      </div>
    </nav>
  );
}
