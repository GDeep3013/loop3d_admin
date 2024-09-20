import React, { useState, useEffect } from "react";
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { formatDateGB } from '../../utils/dateUtils'
import ChartBar from "./ChartBar"
import CompetencyBar from "./CompetencyBar"
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/Auth";


const SurveySummary = () => {
    const { id } = useParams();

    const [completedResponses, setCompletedResponses] = useState({});
    const [totals, setTotals] = useState({});
    const [loader, setLoader] = useState(true);
    const [survey, setSurvey] = useState();
    const [reportData, setReportData] = useState();
    const [participants, setParticipants] = useState();
    const [competencyReport, setCompetencyReport] = useState();
    const [summaryArray, setSummaryArray] = useState([]);
    const [samrtGoals, setSamrtGoals] = useState();


    const removeSpacesFromKeys = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(removeSpacesFromKeys);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
                const newKey = key.replace(/\s+/g, ''); // Remove all spaces from the key
                acc[newKey] = removeSpacesFromKeys(obj[key]);
                return acc;
            }, {});
        }
        return obj;
    };

    const getSurvey = async (survey_id) => {
        try {
            const url = `/api/surveys?survey_id=${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                setSurvey(data?.data?.[0]);
                setLoader(false)
            } else {
                console.error('Failed to fetch survey');
                setLoader(false)

            }
        } catch (error) {
            console.error('Error fetching survey:', error);
            setLoader(false)

        }
    };
    const getTotalParticipantsInvited = async (survey_id) => {
        try {
            setLoader(true);

            const url = `/api/surveys/participants/invited/${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                setCompletedResponses(data.completedResponses || {});
                setTotals(data.totals || {});
                setParticipants(data.participants || {})
            } else {
                console.error('Failed to fetch survey');
            }
        } catch (error) {
            console.error('Error fetching survey:', error);
        }
    }
    const generateSurveyReport = async (survey_id) => {
        try {
            setLoader(true);

            const url = `/api/surveys/generate-report/${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                setReportData(data.reports?.categories || {});
                let summaryValue = removeSpacesFromKeys(data.summary)
                setSummaryArray(summaryValue);
            } else {
                console.error('Failed to fetch survey');
            }
        } catch (error) {
            console.error('Error fetching survey:', error);
        }
    };
    const generateCompetencyAverageReport = async (survey_id) => {
        try {
            setLoader(true);

            const url = `/api/surveys/generate-competency-average/${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                setCompetencyReport(data || {});
            } else {
                console.error('Failed to fetch survey');
            }
        } catch (error) {
            console.error('Error fetching survey:', error);
        } finally {
            setLoader(false);
        }
    };

    const getSmartGoals = async (survey_id, competencyReport) => {
        try {
            // setLoader(true);
            const developmentalOpportunity = competencyReport?.developmentalOpportunity || 'nothing';
            const url = `/api/surveys/smart-goals/${survey_id}/${developmentalOpportunity}/${competencyReport?.topStrength}`;
            console.log('test1', url)
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });


            if (response.ok) {
                console.log('tetauygsdyuh')
                const data = await response.json();
                if (data?.samrtgoals) {
                    setSamrtGoals(data?.samrtgoals)
                    console.log(data)
                }
            } else {
                console.error('Failed to fetch getSmartGoals');
            }
        } catch (error) {
            console.error('Error fetching getSmartGoals:', error);
        } finally {
            // setLoader(false);
        }

    }

    useEffect(() => {
        getSmartGoals(id, competencyReport)
    }, [competencyReport])

    useEffect(() => {
        if (id) {
            getTotalParticipantsInvited(id);
            getSurvey(id)
            generateSurveyReport(id)
            generateCompetencyAverageReport(id)
        }
    }, [id]);

    const Participants = ['Self', 'Direct Report', 'Teammate', 'Supervisor', 'Other'];

    const renderTableRows = (data) => {
        return Participants.map((Participant) => (
            <tr key={Participant}>
                <td className="px-3 md:px-5 py-2 font-poppins border border-gray-300">{Participant}</td>
                <td className="px-3 md:px-5 py-2 font-poppins border border-gray-300">{data?.totals?.[Participant] || 0}</td>
                <td className="px-3 md:px-5 py-2 font-poppins border border-gray-300">{data?.completedResponses?.[Participant] || 0}</td>
            </tr>
        ));
    };

    const renderCharts = () => {
        if (!reportData) return null;

        return Object.entries(reportData).map(([competency, data]) => (
            <ChartBar key={competency} competency={competency} data={data} />
        ));
    };


    const renderCharts2 = () => {
        if (!reportData) {
            return null;
        } else {
            return <CompetencyBar data={reportData} />
        }
        // 
    };

    console.log('samrtGoals', samrtGoals)
    const totalInvited = Participants.reduce((acc, Participant) => acc + (totals[Participant] || 0), 0);
    const totalCompleted = Participants.reduce((acc, Participant) => acc + (completedResponses[Participant] || 0), 0);
    return (
        <AuthLayout title={"Survey Summary"}>
            <div className="survey-inner">
                {!loader && <Container>
                    {/* <CompetencyBar data={reportData} /> */}
                    <div className="survey-container">
                        <h2 className="font-frank text-center mb-4">
                            LOOP3D 360 Report
                        </h2>
                        <div className="participant-name-looped-360 mt-4">
                            <p className="text-sm md:text-base lg:text-lg mb-4 font-poppins">
                                <strong className="text-[#333] font-extrabold">Participant Name:</strong> {survey?.loop_lead?.first_name}
                            </p>
                            <p className="text-sm md:text-base lg:text-lg mb-4 font-poppins">
                                <strong className="text-[#333] font-extrabold">Report Generation Date:</strong> {formatDateGB(survey?.createdAt)}
                            </p>
                            <p className="text-sm md:text-base lg:text-lg leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                                Welcome to your personalized 360° feedback report...
                            </p>
                            <p className="text-sm md:text-base lg:text-lg mb-4 font-poppins">
                                <strong className="text-[#333] font-extrabold">About Your Report</strong>
                            </p>
                            <h3 className="text-custom-color fw-semibold">
                                Total number of responses:
                            </h3>
                            {loader ? (
                                <p>Loading...</p>
                            ) : (
                                <div className="overflow-x-auto mt-3">
                                    <table className="w-100">
                                        <thead>
                                            <tr>
                                                <th className="bg-custom-color px-3 md:px-5 py-2 text-left font-poppins text-white font-normal border border-white">Relationship</th>
                                                <th className="bg-custom-color px-3 md:px-5 py-2 text-left font-poppins text-white font-normal border border-white">Participants Invited</th>
                                                <th className="bg-custom-color px-3 md:px-5 py-2 text-left font-poppins text-white font-normal border border-white">Completed Responses</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {renderTableRows({ completedResponses, totals })}
                                            <tr>
                                                <td className="px-3 md:px-5 py-2 font-poppins font-bold border border-gray-300">Total</td>
                                                <td className="px-3 md:px-5 py-2 font-poppins font-bold border border-gray-300">{totalInvited}</td>
                                                <td className="px-3 md:px-5 py-2 font-poppins font-bold border border-gray-300">{totalCompleted}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <h3 className="text-custom-color fw-semibold mt-3">
                                Here are the participants that you invited:
                            </h3>

                            <ul className="pl-4 sm:pl-6">
                                {participants?.map((participant) => (
                                    <li className="list-disc" key={participant._id}>
                                        {`${participant?.p_first_name} ${participant?.p_last_name} (${participant?.p_type})`}
                                    </li>
                                ))}

                            </ul>
                            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                                Here are the competencies that your manager selected as the most important to your role...
                            </p>
                            <ul className="pl-4 sm:pl-6">
                                {survey?.competencies?.map((competency) => (
                                    <li className="list-disc" key={competency._id}>
                                        {competency?.category_name}
                                    </li>
                                ))}

                            </ul>
                            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                                Below is a summary of your results:
                            </p>

                            {/* graph box */}
                            <div className="graph-box mt-5 mb-5">{renderCharts2()}
                                {/* <CompetencyBar data={reportData} /> */}

                            </div>

                            <h3 className="text-custom-color fw-semibold">Top Strengths:</h3>
                            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                                {competencyReport?.topStrength}
                            </p>

                            <h3 className="text-custom-color fw-semibold">Top Developmental Opportunities:</h3>
                            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                                {competencyReport?.developmentalOpportunity}

                            </p>

                            <h2 className="uppercase font-frank text-custom-color">
                                Summaries by Competency
                            </h2>


                            {/* graph box */}
                            <div className="graph-box mt-5 mb-5">{renderCharts()}
                            </div>
                            {/* graph box */}
                            <div className="graph-box mt-5 mb-5"></div>
                            <h3 className="text-custom-color fw-semibold uppercase">
                                Summary
                            </h3>
                            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                                Here are the competencies that your manager selected as the most important to your role...
                            </p>
                            <div className="chat-gpt-summary">
                                {summaryArray && summaryArray.length > 0 && summaryArray.map((summary, index) => (
                                    <div key={index} className="summary-item">
                                        <h2>Q{index + 1}.  {summary.Question}</h2>
                                        <p><strong>Total Summary:</strong> {summary.TotalSummary}</p>
                                        <p><strong>Self:</strong> {summary.Self}</p>
                                        <p><strong>Direct Report:</strong> {summary.DirectReport}</p>
                                        <p><strong>Teammate:</strong> {summary.Teammate}</p>
                                        <p><strong>Supervisor:</strong> {summary.Supervisor}</p>
                                    </div>
                                ))}
                            </div>
                            {samrtGoals && <div className="chat-gpt-summary chat-smart-goal">
                                <h1>LOOP3D SMART PLAN</h1>

                                {/* Strength Section */}
                                {samrtGoals?.strength && (
                                    <>
                                        <h2>STRENGTHS</h2>
                                        <p><strong>Summary:</strong> {samrtGoals?.strength?.summary}</p>
                                        <p><strong>SMART Plan:</strong></p>
                                        {samrtGoals?.strength?.SMART_Plan?.map((plan, index) => (
                                            <div key={index}>
                                                <p>{index + 1}. {plan.Specific} {plan.Measurable} {plan.Achievable} {plan.Relevant} {plan["Time-bound"]}</p>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Development Opportunity Section */}
                                {samrtGoals?.development_opportunity && (
                                    <>
                                        <h2>DEVELOPMENT OPPORTUNITIES</h2>
                                        <p><strong>Summary:</strong> {samrtGoals?.development_opportunity?.summary}</p>
                                        <p><strong>SMART Plan:</strong></p>
                                        {samrtGoals?.development_opportunity?.SMART_Plan?.map((plan, index) => (
                                            <div key={index}>
                                                <p> {index + 1}. {plan.Specific} {plan.Measurable} {plan.Achievable} {plan.Relevant} {plan["Time-bound"]}</p>

                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>}
                        </div>
                    </div>
                </Container>}
            </div>
        </AuthLayout>
    );
};

export default SurveySummary;
