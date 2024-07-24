
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import './App.css'
import Menu from "./Components/Menu.jsx";
import RoomsListComponent from "./Components/RoomsListComponent.jsx";
import AddRoomForm from "./Components/AddRoomForm.jsx"
import RoomCostListComponent from "./Components/RoomCostListComponent.jsx";
import RoomCostFormComponent from "./Components/RoomCostFormComponent.jsx";
import BookingComponent from "./Components/BookingComponent.jsx";
import BookingFormComponent from "./Components/BookingFormComponent.jsx";
import ShowtimeFormComponent from "./Components/ShowtimeFormComponent.jsx";
import ShowtimeListComponent from "./Components/ShowtimeListComponent.jsx";

const App = () => {
    return (
        <Router>
            <div>
                <Menu />
                <div className="container">
                    <Routes>

                        <Route path="/add-room" element={<AddRoomForm/>} />
                        <Route path="/rooms" element={<RoomsListComponent />} />
                        <Route path="/edit-room/:roomId" element={<AddRoomForm />} />

                        <Route path="/rooms/:roomId/room-costs" element={<RoomCostListComponent />} />
                        <Route path="/room-cost/:roomId/add" element={<RoomCostFormComponent />} />
                        <Route path="/rooms/:roomId/edit-cost/:costId" element={<RoomCostFormComponent />} />

                        <Route path="/rooms/:roomId/showtimes" element={<ShowtimeListComponent />} />
                        <Route path="/rooms/:roomId/add-showtime" element={<ShowtimeFormComponent />} />
                        <Route path="/rooms/:roomId/edit-showtime/:showtimeId" element={<ShowtimeFormComponent />} />

                        <Route path="/bookings" element={<BookingComponent />} />
                        <Route path="/add-booking" element={<BookingFormComponent />} />
                        <Route path="/edit-booking/:bookingId" element={<BookingFormComponent />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App
