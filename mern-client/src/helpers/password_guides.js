/** @format */
import React from 'react';
import { Popover } from 'react-bootstrap';
import validate from '../utils/validate';

export const popover = (password) => {
    return (
        <Popover id='popover-basic' className='reg-overlay border-none'>
            <Popover.Content>
                <div
                    className='font-10 black my-2'
                    style={
                        RegExp(validate.uppercase).test(password)
                            ? {
                                opacity: 0.3,
                                textDecoration: 'line-through',
                            }
                            : {}
                    }
                >
                    One uppercase letter{' '}
                </div>
                <div
                    className='font-10 black my-2'
                    style={
                        RegExp(validate.lowercase).test(password)
                            ? {
                                opacity: 0.3,
                                textDecoration: 'line-through',
                            }
                            : {}
                    }
                >
                    One lowercase letter{' '}
                </div>
                <div
                    className='font-10 black my-2'
                    style={
                        RegExp(validate.number).test(password)
                            ? {
                                opacity: 0.3,
                                textDecoration: 'line-through',
                            }
                            : {}
                    }
                >
                    One number{' '}
                </div>
                <div
                    className='font-10 black my-2'
                    style={
                        RegExp(validate.special_character).test(password)
                            ? {
                                opacity: 0.3,
                                textDecoration: 'line-through',
                            }
                            : {}
                    }
                >
                    One special character{' '}
                </div>
                <div
                    className='font-10 black my-2'
                    style={
                        password && password.length > 7
                            ? {
                                opacity: 0.3,
                                textDecoration: 'line-through',
                            }
                            : {}
                    }
                >
                    8+ character{' '}
                </div>
            </Popover.Content>
        </Popover>
    );
};
