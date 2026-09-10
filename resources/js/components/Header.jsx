import { usePage } from '@inertiajs/react';
import DashboardHeader from './DashboardHeader';

export default function Header({ sidebarOpen, onToggleSidebar, onSearch, searchTerm, setSearchTerm }) {
    const { auth } = usePage().props;

    // Always use DashboardHeader design for all pages
    return <DashboardHeader user={auth.user} onSearch={onSearch} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
}
