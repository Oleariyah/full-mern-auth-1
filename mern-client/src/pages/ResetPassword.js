import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, OverlayTrigger } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { popover } from "../helpers/password_guides";
import axios from "axios";
import { Redirect } from "react-router-dom";
import jwt from "jsonwebtoken";
import validate from "../utils/validate.json";
import { useLocation, Link } from "react-router-dom";

export default function ResetPassword() {
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState("");
    const [token, setToken] = useState("")
    const [password, setPassword] = useState();
    const [value, setValue] = useState();
    const [validated, setValidated] = useState();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.currentTarget;

        if (form.checkValidity() === true) {
            const { newPassword, confirmPassword } = value;
            const isConfirmed = newPassword === confirmPassword;
            setLoading(true);
            if (isConfirmed) {
                setValidated(false);
                resetPassword(value);
            } else {
                toast.error("Oops! The provided passwords do not match the confirmed password.")
                setLoading(false);
            }
        } else {
            setValidated(true);
            toast.info("Please fill the fields")
        }
    }

    const handleValue = (e) => {
        setValue({ ...value, [e.target.name]: e.target.value });
    };

    const resetPassword = async (user) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/reset`,
                {
                    user: { newPassword: user.newPassword, resetPasswordLink: token }
                });
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
        <Form noValidate onSubmit={handleSubmit} validated={validated} >
            <ToastContainer />
            <div className="container" style={{ width: "50%" }}>
                <div className="m-5 p-5">
                    <div className="my-5">
                        <h2>Reset your password.</h2>
                    </div>
                    {<Form.Group controlId="validationCustom01">
                        <Form.Label>Password</Form.Label>
                        <OverlayTrigger
                            trigger="focus"
                            placement="right"
                            overlay={popover(password)}
                        >
                            <Form.Control
                                name="newPassword"
                                minLength={8}
                                onChange={e => {
                                    setPassword(e.target.value)
                                    handleValue(e)
                                }}
                                pattern={validate.password}
                                type="password"
                                className="py-4"
                                required
                            />
                        </OverlayTrigger>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid password.
                                </Form.Control.Feedback>
                    </Form.Group>
                    }
                    {<Form.Group controlId="validationCustom02">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            name="confirmPassword"
                            onChange={e => handleValue(e)}
                            type="password"
                            className="py-4"
                            minLength={8}
                            pattern={validate.password}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid password.
                                </Form.Control.Feedback>
                    </Form.Group>
                    }
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
                            <span className="ml-2">Reset</span>
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
