Xavro
(https://xavro-1.onrender.com/)

Overview
Xavro is a web application designed to streamline the process of scheduling and booking escape rooms. The platform allows administrators to create and manage escape rooms and showtimes, while regular users can view availability and book rooms for their preferred showtimes.

Features
For Administrators:
Create and Manage Escape Rooms: Administrators can create, edit, and delete escape rooms.
Create and Manage Showtimes: Administrators can set up and manage showtimes for each escape room.
Customer Management: Admins can view and manage customer details.

For Regular Users:
View Room Availability: Users can see available rooms and showtimes using an interactive calendar.
Book Rooms: Users can book an escape room for a specific showtime by providing their details.
User-Friendly Interface: The site offers an intuitive and easy-to-navigate interface for both administrators and regular users.

User Flow
Homepage: Users land on the homepage where they can select a room from a dropdown menu.
Calendar View: Once a room is selected, the calendar updates to show the availability of that room.
Booking Showtimes: Users can click on an available date to see the showtimes. They can then click on "Book Now" for their preferred timeslot.
Booking Form: A modal appears where users can enter their email to retrieve their details or fill in their information if they are new.
Confirmation: Upon confirming, the booking is saved, and the user is notified.

API
Xavro includes a RESTful API to facilitate CRUD operations on all database tables (rooms, showtimes, customers, bookings). The API endpoints support creating, reading, updating, and deleting records, ensuring a flexible and robust back-end system.

Notable Endpoints:
/api/customers: CRUD operations for customer data.
/api/rooms: CRUD operations for room data.
/api/showtimes: CRUD operations for showtime data.
/api/bookings: CRUD operations for booking data.

Technology Stack
Backend: Python, Flask
Frontend: Vite, React
Database: SQLAlchemy (used with PostgreSQL)
Styling: Bootstrap, custom CSS

Additional Notes
Interactive Calendar: The calendar component highlights available dates based on the selected room and dynamically updates as bookings are made.
Real-time Updates: The application ensures that booking information is always up-to-date, reducing the risk of double bookings.
Human-Readable Order IDs: The system generates unique, human-readable order IDs for easy reference and management.

Conclusion
Xavro offers a comprehensive solution for managing and booking escape rooms. Its intuitive interface and robust backend make it an ideal choice for both administrators and users looking to streamline the booking process. The inclusion of a RESTful API ensures that the application can be easily extended and integrated with other systems.
