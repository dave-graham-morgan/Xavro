
import React, {useState} from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'

const AddRoom = () => {
    const [roomFormData, setRoomFormData] = useState({
        title:'',
        maxCapacity: '',
        minCapacity:'',
        duration:'',
        resetBuffer:'',
        launchDate:'',
        sunsetDate:'',
        description:''
    });

    const [responseMessage, setResponseMessage] = useState();

    const handleChange = (e) => {
        const {name, value} = e.target;
        setRoomFormData({
            ...roomFormData,
            [name]:value
        });
    }

    //we need a special event handler for the datepickers because they don't emit standard event objects
    const handleDateChange = (name, value) => {
        setRoomFormData({
            ...roomFormData,
            [name]:value
        });
    }
    //create state to hold form errors
    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        setFormErrors(errors);

        // console.log(import.meta.env.VITE_API_BASE_URL) //this will log the base URL to send data

        if (Object.keys(errors).length === 0) {
            // No errors, send data to the backend
            const dataToSend = {
                ...roomFormData,
                maxCapacity: parseInt(roomFormData.maxCapacity, 10),
                minCapacity: parseInt(roomFormData.minCapacity, 10),
                duration: parseInt(roomFormData.duration, 10),
                resetBuffer: parseInt(roomFormData.resetBuffer, 10)
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Form submitted successfully:', data);
                    setResponseMessage(data.message)
                    // Handle success (e.g., show a success message or redirect)
                } else {
                    console.error('Form submission failed:', response.statusText);
                    console.log(response)
                    // Handle error response from the server
                }
            } catch (error) {
                console.error('Error submitting form to server:', error);
                // Handle network or other errors
            }
        }

    }

    const validateForm = () => {
        const errors = {};
        if(!roomFormData.title) errors.title = 'Room Title is required';
        if(!roomFormData.maxCapacity) {
            errors.maxCapacity = 'Max Capacity is required';
        }else if(!Number.isInteger(parseInt(roomFormData.maxCapacity,10))){
            errors.maxCapacity = 'Max Capacity must be an integer';
        }

        if(!roomFormData.minCapacity) {
            errors.minCapacity = 'Min Capacity is required';
        }else if(!Number.isInteger(parseInt(roomFormData.minCapacity,10))){
            errors.minCapacity = 'Min Capacity must be an integer';
        }

        if(!roomFormData.duration) {
            errors.duration = 'Duration is required';
        }else if(!Number.isInteger(parseInt(roomFormData.duration,10))){
            errors.duration = 'Duration must be an integer';
        }
        if(!roomFormData.resetBuffer) {
            errors.resetBuffer = 'Reset Buffer is required';
        }else if(!Number.isInteger(parseInt(roomFormData.resetBuffer,10))){
            errors.resetBuffer = 'Reset Buffer must be an integer';
        }

        return errors;

    }

    return(
        <>
            <form>
                <div>
                    <label>Room Name:</label>
                    <input type="text"  name="title" value={roomFormData.title} onChange={handleChange}/>
                    {formErrors.title && <span>{formErrors.title}</span>}
                </div>
                <div>
                    <label>Max Capacity:</label>
                    <input type="text" name="maxCapacity" value={roomFormData.maxCapacity} onChange={handleChange}/>
                    {formErrors.maxCapacity && <span>{formErrors.maxCapacity}</span>}
                </div>
                <div>
                    <label>Min Capacity:</label>
                    <input type="text" name="minCapacity" value={roomFormData.minCapacity} onChange={handleChange}/>
                    {formErrors.minCapacity && <span>{formErrors.minCapacity}</span>}
                </div>
                <div>
                    <label>Duration:</label>
                    <input type="text" name="duration" value={roomFormData.duration} onChange={handleChange}/>
                    {formErrors.duration && <span>{formErrors.duration}</span>}
                </div>
                <div>
                    <label>Reset Buffer:</label>
                    <input type="text" name="resetBuffer" value={roomFormData.resetBuffer} onChange={handleChange}/>
                    {formErrors.resetBuffer && <span>{formErrors.resetBuffer}</span>}
                </div>
                <div>
                    <label>Launch Date:</label>
                    <DatePicker
                        selected={roomFormData.launchDate}
                        name="launchDate"
                        onChange={(date) => handleDateChange('launchDate', date)}
                        placeholderText="Select Launch Date"
                        dateFormat="MMMM dd, yyyy"
                    />

                </div>
                <div>
                    <label>Sunset Date: </label>
                    <DatePicker
                        name="sunsetDate"
                        selected={roomFormData.sunsetDate}
                        onChange={(date) => handleDateChange('sunsetDate', date)}
                        placeholderText="Select Sunset Date"
                        dateFormat="MMMM dd, yyyy"
                    />
                </div>
                <div>
                    <label>Description: </label>
                    <textarea
                        name="description"
                        value={roomFormData.description}
                        onChange={handleChange}
                    />
                </div>
                <button onClick={handleSubmit}>Submit</button>
                {responseMessage && <p style={{ color: 'green' }}>{responseMessage}</p>}
            </form>
        </>
    )
}
export default AddRoom