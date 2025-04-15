import {
    LayoutDashboard,
    Package,
    PackagePlus,
    PackageCheck,
    ShoppingCart,
    Stethoscope,
    UserPlus,
    ClipboardList,
    FlaskConical,
    FlaskRound,
    TestTube2,
    Users,
    Building,
    Hospital,
    LogOut
} from 'lucide-react';

export const routes = [
    {
        path: "/",
        name: "Dashboard",
        icon: LayoutDashboard,
        component: "Dashboard",
        children: [
            // Products with subcategories
            {
                path: "products",
                name: "Products",
                icon: Package,
                component: "Products",
                children: [
                    {
                        path: "products/all",
                        name: "All Products",
                        icon: Package,
                        component: "AllProducts"
                    },
                    {
                        path: "products/create",
                        name: "Create Product",
                        icon: PackagePlus,
                        component: "CreateProduct"
                    }
                ]
            },
            // Orders
            {
                path: "orders",
                name: "Orders",
                icon: ShoppingCart,
                component: "Orders"
            },
            // Doctors
            {
                path: "doctors/all",
                name: "Doctors",
                icon: Stethoscope,
                component: "Doctors",
            },
            // Clinics
            {
                path: "clinics/all",
                name: "Clinics",
                icon: Building,
                component: "Clinics",
            },
            // Lab Tests
            {
                path: "labtests/all",
                name: "Lab Tests",
                icon: FlaskConical,
                component: "LabTests",
            },
            // Users
            {
                path: "users",
                name: "Users",
                icon: Users,
                component: "Users"
            },
        ]
    }
];