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
                        path: "all",
                        name: "All Products",
                        icon: Package,
                        component: "AllProducts"
                    },
                    {
                        path: "create",
                        name: "Create Product",
                        icon: PackagePlus,
                        component: "CreateProduct"
                    },
                    {
                        path: "update",
                        name: "Update Product",
                        icon: PackageCheck,
                        component: "UpdateProduct"
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
            // Doctors with subcategories
            {
                path: "doctors",
                name: "Doctors",
                icon: Stethoscope,
                component: "Doctors",
                children: [
                    {
                        path: "all",
                        name: "All Doctors",
                        icon: Stethoscope,
                        component: "AllDoctors"
                    },
                    {
                        path: "update",
                        name: "Update Doctors",
                        icon: ClipboardList,
                        component: "UpdateDoctors"
                    },
                    {
                        path: "register",
                        name: "Register New",
                        icon: UserPlus,
                        component: "RegisterDoctor"
                    }
                ]
            },
            // Clinics with subcategories
            {
                path: "clinics",
                name: "Clinics",
                icon: Building,
                component: "Clinics",
                children: [
                    {
                        path: "all",
                        name: "All Clinics",
                        icon: Building,
                        component: "AllClinics"
                    },
                    {
                        path: "add-doctors",
                        name: "Add Doctors",
                        icon: UserPlus,
                        component: "AddDoctorsToClinic"
                    },
                    {
                        path: "register",
                        name: "Register New",
                        icon: Hospital,
                        component: "RegisterClinic"
                    }
                ]
            },
            // Lab Tests with subcategories
            {
                path: "labtests",
                name: "Lab Tests",
                icon: FlaskConical,
                component: "LabTests",
                children: [
                    {
                        path: "all",
                        name: "All Tests",
                        icon: FlaskConical,
                        component: "AllLabTests"
                    },
                    {
                        path: "update",
                        name: "Update Tests",
                        icon: FlaskRound,
                        component: "UpdateTests"
                    },
                    {
                        path: "add",
                        name: "Add New Test",
                        icon: TestTube2,
                        component: "AddLabTest"
                    }
                ]
            },
            // Users
            {
                path: "users",
                name: "Users",
                icon: Users,
                component: "Users"
            },
            // Logout
            {
                path: "logout",
                name: "Logout",
                icon: LogOut,
                component: "Logout"
            }
        ]
    }
];