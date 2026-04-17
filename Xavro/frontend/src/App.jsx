import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import EmployeeRoute from "./Components/Auth/EmployeeRouteComponent.jsx";
import AdminRoute from "./Components/Auth/AdminRouteComponent.jsx";
import StaffLayout from "./layouts/StaffLayout.jsx";

// Customer-facing pages
import CustomerHomePage from "./Pages/CustomerHomePage.jsx";
import CustomerRoomsPage from "./Pages/CustomerRoomsPage.jsx";
import CustomerRoomDetailPage from "./Pages/CustomerRoomDetailPage.jsx";

// Auth
import LoginFormComponent from "./Components/Auth/LoginFormComponent.jsx";
import RegisterFormComponent from "./Components/Auth/RegisterFormComponent.jsx";

// Staff components
import RoomListComponent from "./Components/Room/RoomListComponent.jsx";
import RoomFormComponent from "./Components/Room/RoomFormComponent.jsx";
import RoomCostListComponent from "./Components/RoomCost/RoomCostListComponent.jsx";
import RoomCostFormComponent from "./Components/RoomCost/RoomCostFormComponent.jsx";
import BookingListComponent from "./Components/Booking/BookingListComponent.jsx";
import BookingFormComponent from "./Components/Booking/BookingFormComponent.jsx";
import ShowtimeFormComponent from "./Components/Showtime/ShowtimeFormComponent.jsx";
import ShowtimeListComponent from "./Components/Showtime/ShowtimeListComponent.jsx";
import CustomerListComponent from "./Components/Customer/CustomerListComponent.jsx";
import CustomerFormComponent from "./Components/Customer/CustomerFormComponent.jsx";

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
                    <Route path="/register" element={<RegisterFormComponent />} />

                    {/* ── Staff: Employee+ ── */}
                    <Route element={<EmployeeRoute />}>
                        <Route path="/staff/bookings" element={<StaffLayout><BookingListComponent /></StaffLayout>} />
                        <Route path="/staff/bookings/add" element={<StaffLayout><BookingFormComponent /></StaffLayout>} />
                        <Route path="/staff/bookings/edit/:bookingId" element={<StaffLayout><BookingFormComponent /></StaffLayout>} />

                        <Route path="/staff/customers" element={<StaffLayout><CustomerListComponent /></StaffLayout>} />
                        <Route path="/staff/customers/add" element={<StaffLayout><CustomerFormComponent /></StaffLayout>} />
                        <Route path="/staff/customers/:customerId/edit" element={<StaffLayout><CustomerFormComponent /></StaffLayout>} />

                        <Route path="/staff/rooms" element={<StaffLayout><RoomListComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/:roomId/room-costs" element={<StaffLayout><RoomCostListComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/:roomId/showtimes" element={<StaffLayout><ShowtimeListComponent /></StaffLayout>} />
                    </Route>

                    {/* ── Staff: Admin only ── */}
                    <Route element={<AdminRoute />}>
                        <Route path="/staff/rooms/add" element={<StaffLayout><RoomFormComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/edit/:roomId" element={<StaffLayout><RoomFormComponent /></StaffLayout>} />

                        <Route path="/staff/rooms/:roomId/costs/add" element={<StaffLayout><RoomCostFormComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/:roomId/costs/edit/:costId" element={<StaffLayout><RoomCostFormComponent /></StaffLayout>} />

                        <Route path="/staff/rooms/:roomId/showtimes/add" element={<StaffLayout><ShowtimeFormComponent /></StaffLayout>} />
                        <Route path="/staff/rooms/:roomId/showtimes/edit/:showtimeId" element={<StaffLayout><ShowtimeFormComponent /></StaffLayout>} />
                    </Route>

                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
