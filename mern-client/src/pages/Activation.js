import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { Redirect } from "react-router-dom";
import jwt from "jsonwebtoken";
import { useLocation, Link } from "react-router-dom";

export default function Activation() {
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState("");
    const [token, setToken] = useState()

    const location = useLocation();

    useEffect(() => {
        if (location && location.search) {
            const getQuery = location.search;
            const token = getQuery.substring(3);
            const data = jwt.decode(token);
            setData(data);
            setToken(token)
        }
    }, [])


    const { name } = data;

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        activateUser(token);
    }

    const activateUser = async (token) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/activate`, { token });
            const { data } = response;
            const { message } = data;
            toast.success(message);
            setLoading(false);
        } catch (err) {
            if (err && err.response && err.response.data) {
                toast.error(err.response.data.error)
            }
            setLoading(false);
        }
    }

    return (
        <Form noValidate onSubmit={handleSubmit}>
            <ToastContainer />
            <div className="container" style={{ width: "50%" }}>
                <div className="m-5 p-5">
                    <div className="my-5">
                        <h2>Welcome!</h2>
                        <h5>{name}</h5>
                    </div>
                    <div className="d-flex flex-grow-2">
                        <Button
                            className="mt-2 mb-4 py-2 btn-block"
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />}
                            <span className="ml-2">Activate Your Acoount</span>
                        </Button>
                    </div>
                    <div className="my-3">
                        <hr />
                    </div>
                    <Link variant="light" className="btn-block" to="/">
                        Go to Login
                    </Link>
                </div>
            </div>
        </Form>
    )
}
