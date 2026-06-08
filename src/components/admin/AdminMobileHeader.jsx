import { Logo } from '../common/Logo'
import { Menu } from 'lucide-react';

export default function AdminMobileHeader({onMenuOpen}) {
  return (
    <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-gray-900 px-4 text-white dark:bg-gray-950 md:hidden">
        <Logo />
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-lg p-2 text-gray-300 hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
  )
}