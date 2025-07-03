import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { IRootState } from '@/store';
import { restoreAuth } from '@/store/authSlice';
import { useDispatch } from 'react-redux';

export const usePermissions = () => {
    const dispatch = useDispatch();
    const roleId = useSelector((state: IRootState) => state.auth.user?.roleId);
    const roleName = useSelector((state: IRootState) => state.auth.user?.roleName);
    const isAuthenticated = useSelector((state: IRootState) => state.auth.isAuthenticated);
    const token = useSelector((state: IRootState) => state.auth.token);

    // Ensure authentication state is restored
    useEffect(() => {
        if (token && !roleId) {
            // Token exists but user data is missing, try to restore
            dispatch(restoreAuth());
        }
    }, [token, roleId, dispatch]);

    const hasPermission = (permission: string): boolean => {
        if (!roleId) return false;

        const permissions = getRolePermissions(roleId);
        return permissions.includes(permission);
    };

    const canView = (module: string): boolean => {
        return hasPermission(`${module}.view`);
    };

    const canCreate = (module: string): boolean => {
        return hasPermission(`${module}.create`);
    };

    const canEdit = (module: string): boolean => {
        return hasPermission(`${module}.edit`);
    };

    const canDelete = (module: string): boolean => {
        return hasPermission(`${module}.delete`);
    };

    const canManage = (module: string): boolean => {
        return hasPermission(`${module}.manage`);
    };

    const isFactoryManager = (): boolean => {
        return roleId === 1;
    };

    const isAccountant = (): boolean => {
        return roleId === 2;
    };

    const isProductionStaff = (): boolean => {
        return roleId === 3;
    };

    return {
        roleId,
        roleName,
        isAuthenticated,
        hasPermission,
        canView,
        canCreate,
        canEdit,
        canDelete,
        canManage,
        isFactoryManager,
        isAccountant,
        isProductionStaff,
    };
};

const getRolePermissions = (roleId: number): string[] => {
    switch (roleId) {
        case 1: // Chủ xưởng
            return [
                'dashboard.view', 'dashboard.manage',
                'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
                'production.view', 'production.create', 'production.edit', 'production.delete',
                'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
                'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.delete',
                'glue.view', 'glue.create', 'glue.edit', 'glue.delete',
                'messages.view', 'messages.manage',
                'users.view', 'users.create', 'users.edit', 'users.delete'
            ];
        case 2: // Kế toán
            return [
                'dashboard.view',
                'orders.view',
                'production.view',
                'customers.view',
                'quotes.view', 'quotes.create', 'quotes.edit',
                'reports.view', 'reports.create'
            ];
        case 3: // Bộ phận sản xuất
            return [
                'dashboard.view',
                'orders.view',
                'production.view', 'production.edit',
                'glue.view'
            ];
        default:
            return [];
    }
}; 