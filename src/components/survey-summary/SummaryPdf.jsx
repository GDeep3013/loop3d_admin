import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SummaryPdf = () => {
    const location = useLocation();

    const getQueryParams = () => {
        const searchParams = new URLSearchParams(location.search);
        const reportRef = searchParams.get('reportRef'); // Get the reportRef query parameter
        return reportRef;
    };

    // Get the reportRef
    const reportRef = getQueryParams();

console.log('reportRef',reportRef)
    return (
        <div>
            <h1>Generating your report...</h1>
            <p>Please wait while we download your PDF report.</p>
        </div>
    );
};

export default SummaryPdf;