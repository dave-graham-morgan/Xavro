import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

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

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>

                    {/* ── Customer-facing (no staff nav) ── */}
                    <Route path="/" element={<CustomerHomePage />} />
                    <Route path="/rooms" element={<CustomerRoomsPage />} />
                    <Route path="/rooms/:roomId" element={<CustomerRoomDetailPage />} />

                    {/* ── Auth ── */}
                    <Route path="/login" element={<LoginFormComponent />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* ── Staff: Employee+ ── */}
                    <Route element={<EmployeeRoute />}>
                        <Route path="/staff/checkin" element={<StaffLayout><CheckInPage /></StaffLayout>} />
                        <Route path="/staff/profile" element={<StaffLayout><ProfilePage /></StaffLayout>} />
                        <Route path="/staff/bookings" element={<StaffLayout><BookingListComponent /></StaffLayout>} />
                        <Route path="/staff/bookings/add" element={<StaffLayout><BookingFormComponent /></StaffLayout>} />
                        <Route path="/staff/bookings/edit/:bookingId" element={<StaffLayout><BookingFormComponent /></StaffLayout>} />

                        <Route path="/staff/customers" element={<StaffLayout><CustomerListComponent /></StaffLayout>} />
                        <Route path="/staff/customers/add" element={<StaffLayout><CustomerFormComponent /></StaffLayout>} />
                        <Route path="/staff/customers/:customerId/edit" element={<StaffLayout><CustomerFormComponent /></StaffLayout>} />

                        <Route path="/staff/rooms" element={<StaffLayout><RoomListComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/:roomId/room-costs" element={<StaffLayout><RoomCostListComponent /></StaffLayout>} />
                    </Route>

                    {/* ── Staff: Admin only ── */}
                    <Route element={<AdminRoute />}>
                        <Route path="/staff/users" element={<StaffLayout><UsersPage /></StaffLayout>} />
                        <Route path="/staff/rooms/add" element={<StaffLayout><RoomFormComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/edit/:roomId" element={<StaffLayout><RoomFormComponent /></StaffLayout>} />

                        <Route path="/staff/rooms/:roomId/costs/add" element={<StaffLayout><RoomCostFormComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/:roomId/costs/edit/:costId" element={<StaffLayout><RoomCostFormComponent /></StaffLayout>} />

                    </Route>

                    {/* ── 404 ── */}
                    <Route path="*" element={<NotFoundPage />} />

                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
