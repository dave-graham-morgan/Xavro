
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import Menu from "./Components/Navigation/Menu.jsx";
import RoomListComponent from "./Components/Room/RoomListComponent.jsx";
import RoomFormComponent from "./Components/Room/RoomFormComponent.jsx"
import RoomCostListComponent from "./Components/RoomCost/RoomCostListComponent.jsx";
import RoomCostFormComponent from "./Components/RoomCost/RoomCostFormComponent.jsx";
import BookingComponent from "./Components/Booking/BookingComponent.jsx";
import BookingFormComponent from "./Components/Booking/BookingFormComponent.jsx";
import ShowtimeFormComponent from "./Components/Showtime/ShowtimeFormComponent.jsx";
import ShowtimeListComponent from "./Components/Showtime/ShowtimeListComponent.jsx";
import CustomerListComponent from "./Components/Customer/CustomerListComponent.jsx";
import CustomerFormComponent from "./Components/Customer/CustomerFormComponent.jsx";

const App = () => {
    return (
        <Router>
            <div>
                <Menu />
                <div className="container">
                    <Routes>

                        <Route path="/rooms" element={<RoomListComponent />} />
                        <Route path="/rooms/add-room" element={<RoomFormComponent/>} />
                        <Route path="/rooms/edit-room/:roomId" element={<RoomFormComponent />} />

                        <Route path="/rooms/:roomId/room-costs" element={<RoomCostListComponent />} />
                        <Route path="/rooms/:roomId/add-cost" element={<RoomCostFormComponent />} />
                        <Route path="/rooms/:roomId/edit-cost/:costId" element={<RoomCostFormComponent />} />

                        <Route path="/rooms/:roomId/showtimes" element={<ShowtimeListComponent />} />
                        <Route path="/rooms/:roomId/add-showtime" element={<ShowtimeFormComponent />} />
                        <Route path="/rooms/:roomId/edit-showtime/:showtimeId" element={<ShowtimeFormComponent />} />

                        <Route path="/bookings" element={<BookingComponent />} />
                        <Route path="/add-booking" element={<BookingFormComponent />} />
                        <Route path="/edit-booking/:bookingId" element={<BookingFormComponent />} />

                        <Route path="/customers" element={<CustomerListComponent/>} />
                        <Route path="/customers/add-customer" element={<CustomerFormComponent/>} />
                        <Route path="/customers/:customerId/edit-customer" element={<CustomerFormComponent/>} />

                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App
