import React, { useEffect, useRef } from 'react';
import QrScanner from 'react-qr-scanner';

const CustomQrScanner = (props) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current.querySelector('canvas');
        if (canvas) {
            canvas.getContext('2d', { willReadFrequently: true });
        }
    }, []);

    return <QrScanner ref={canvasRef} {...props} />;
};

export default CustomQrScanner;