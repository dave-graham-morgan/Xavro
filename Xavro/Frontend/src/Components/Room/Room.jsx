// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
//
// const RoomComponent = () => {
//     const { roomId } = useParams();
//     const [room, setRoom] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//
//     useEffect(() => {
//         const fetchRoom = async () => {
//             try {
//                 const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`);
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const data = await response.json();
//                 setRoom(data);
//                 setLoading(false);
//             } catch (error) {
//                 setError(error);
//                 setLoading(false);
//             }
//         };
//
//         fetchRoom();
//     }, [roomId]);
//
//     if (loading) {
//         return <div>Loading...</div>;
//     }
//
//     if (error) {
//         return <div>Error: {error.message}</div>;
//     }
//
//     return (
//         <div className="container mt-5">
//             <div className="card">
//                 <div className="card-header">
//                     <h2>{room.title}</h2>
//                 </div>
//                 <div className="card-body">
//                     <p><strong>Max Capacity:</strong> {room.max_capacity}</p>
//                     <p><strong>Min Capacity:</strong> {room.min_capacity}</p>
//                     <p><strong>Duration:</strong> {room.duration} minutes</p>
//                     <p><strong>Reset Buffer:</strong> {room.reset_buffer} minutes</p>
//                     <p><strong>Launch Date:</strong> {room.launch_date}</p>
//                     <p><strong>Sunset Date:</strong> {room.sunset_date}</p>
//                     <p><strong>Description:</strong> {room.description}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default RoomComponent;
