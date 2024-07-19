import React, {useState} from "react";

const LoginForm = ({onSubmit}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({username, password});
    };
    return (
        <>
            <form >
                <div>
                    <label>Username:</label>
                    <input type="text" palceholder="username" value={username} onChange={(e) => setUsername(e.target.value) }/>
                </div>
                <div>
                    <label>Password:</label>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <button onClick={handleSubmit}>
                    submit
                </button>
            </form>
        </>
    );
}
export default LoginForm;