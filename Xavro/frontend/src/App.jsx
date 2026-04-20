import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import EmployeeRoute from "./Components/Auth/EmployeeRouteComponent.jsx";
import AdminRoute from "./Components/Auth/AdminRouteComponent.jsx";
import StaffLayout from "./layouts/StaffLayout.jsx";

// Customer-facing pages
import CustomerHomePage from "./Pages/CustomerHomePage.jsx";
import CustomerRoomsPage from "./Pages/CustomerRoomsPage.jsx";
import CustomerRoomDetailPage from "./Pages/CustomerRoomDetailPage.jsx";

// Other
import NotFoundPage from "./Pages/NotFoundPage.jsx";

// Auth
import LoginFormComponent from "./Components/Auth/LoginFormComponent.jsx";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./Pages/ResetPasswordPage.jsx";

// Staff components
import RoomListComponent from "./Components/Room/RoomListComponent.jsx";
import RoomFormComponent from "./Components/Room/RoomFormComponent.jsx";
import RoomCostListComponent from "./Components/RoomCost/RoomCostListComponent.jsx";
import RoomCostFormComponent from "./Components/RoomCost/RoomCostFormComponent.jsx";
import BookingListComponent from "./Components/Booking/BookingListComponent.jsx";
import BookingFormComponent from "./Components/Booking/BookingFormComponent.jsx";
import CustomerListComponent from "./Components/Customer/CustomerListComponent.jsx";
import CustomerFormComponent from "./Components/Customer/CustomerFormComponent.jsx";
import UsersPage from "./Pages/UsersPage.jsx";
import ProfilePage from "./Pages/ProfilePage.jsx";
import CheckInPage from "./Pages/CheckInPage.jsx";

const router = createBrowserRouter([
    // ── Customer-facing ──
    { path: "/",            element: <CustomerHomePage /> },
    { path: "/rooms",       element: <CustomerRoomsPage /> },
    { path: "/rooms/:roomSlug", element: <CustomerRoomDetailPage /> },

    // ── Auth ──
    { path: "/xavro",           element: <LoginFormComponent /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password",  element: <ResetPasswordPage /> },

    // ── Staff: Employee+ ──
    {
        element: <EmployeeRoute />,
        children: [
            { path: "/staff/checkin",  element: <StaffLayout><CheckInPage /></StaffLayout> },
            { path: "/staff/profile",  element: <StaffLayout><ProfilePage /></StaffLayout> },
            { path: "/staff/bookings", element: <StaffLayout><BookingListComponent /></StaffLayout> },
            { path: "/staff/bookings/add", element: <StaffLayout><BookingFormComponent /></StaffLayout> },
            { path: "/staff/bookings/edit/:bookingId", element: <StaffLayout><BookingFormComponent /></StaffLayout> },
            { path: "/staff/customers", element: <StaffLayout><CustomerListComponent /></StaffLayout> },
            { path: "/staff/customers/add", element: <StaffLayout><CustomerFormComponent /></StaffLayout> },
            { path: "/staff/customers/:customerId/edit", element: <StaffLayout><CustomerFormComponent /></StaffLayout> },
            { path: "/staff/rooms", element: <StaffLayout><RoomListComponent /></StaffLayout> },
            { path: "/staff/rooms/:roomId/room-costs", element: <StaffLayout><RoomCostListComponent /></StaffLayout> },
        ],
    },

    // ── Staff: Admin only ──
    {
        element: <AdminRoute />,
        children: [
            { path: "/staff/users", element: <StaffLayout><UsersPage /></StaffLayout> },
            { path: "/staff/rooms/add", element: <StaffLayout><RoomFormComponent /></StaffLayout> },
            { path: "/staff/rooms/edit/:roomId", element: <StaffLayout><RoomFormComponent /></StaffLayout> },
            { path: "/staff/rooms/:roomId/costs/add", element: <StaffLayout><RoomCostFormComponent /></StaffLayout> },
            { path: "/staff/rooms/:roomId/costs/edit/:costId", element: <StaffLayout><RoomCostFormComponent /></StaffLayout> },
        ],
    },

    // ── 404 ──
    { path: "*", element: <NotFoundPage /> },
]);

const App = () => (
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
);

export default App;
