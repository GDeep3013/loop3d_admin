import React, { useState, useRef, useEffect } from "react";
import { Container, Dropdown, Row,Spinner, Col, Button } from 'react-bootstrap';
import { formatDateGB } from '../../utils/dateUtils'
import ChartBar from "./ChartBar"
import CompetencyBar from "./CompetencyBar"
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/Auth";
import Loading from "../Loading";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';

import html2pdf from 'html2pdf.js';
// import { color } from "chart.js/helpers";
// import SummaryPdf from './SummaryPdf'
// import ReactDOMServer from 'react-dom/server';
const SurveySummary = () => {
    const { id } = useParams();
    const navigate = useNavigate()
    let images = {
        chartRef1: [],
        chartRef2: []
    };
    const [completedResponses, setCompletedResponses] = useState({});
    const [totals, setTotals] = useState({});
    const [loader, setLoader] = useState(true);
    const [survey, setSurvey] = useState();
    const [reportData, setReportData] = useState();
    const [participants, setParticipants] = useState();
    const [competencyReport, setCompetencyReport] = useState();
    const [summaryArray, setSummaryArray] = useState([]);
    // const [samrtGoals, setSamrtGoals] = useState();
    const [pdf, setPdf] = useState(false);
    const [chart2Data, setChart2Data] = useState();
    const [savedImages, setSavedImages] = useState();
  const user = useSelector((state) => state.auth.user);

    const reportRef = useRef(null);
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
                console.log('data',data)
                setSurvey(data?.data?.[0]);
            } else {
                console.error('Failed to fetch survey');
            }
        } catch (error) {
            console.error('Error fetching survey:', error);

        }
    };
    const getTotalParticipantsInvited = async (survey_id) => {
        try {

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
    const GeneratePlans = async () => {
        try {
            console.log('competencyReport3',competencyReport)

            if (!competencyReport?.developmentalOpportunity || !competencyReport?.topStrength) {
                console.error('Developmental Opportunity or Top Strength is undefined.');
                return; // Exit the function if values are missing
            }
            const developmentalOpportunity = competencyReport?.developmentalOpportunity || 'nothing';
            const url = `/api/surveys/smart-goals/${id}/${developmentalOpportunity}/${competencyReport?.topStrength}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });


            if (response.ok) {
                const data = await response.json();
            } else {
                console.error('Failed to fetch getSmartGoals');
            }
        } catch (error) {
            console.error('Error fetching getSmartGoals:', error);
        } finally {
            // setLoader(false);
        }
    };
    const generateSurveyReport = async (survey_id, action) => {
        try {

            const url = `/api/surveys/generate-report/${survey_id}?action=${action}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                setReportData(data.reports?.categories || {});
                setChart2Data(data.reports?.resultArray || {})
                // let summaryValue = removeSpacesFromKeys(data.summary.response_Data)
                let newData = (data.summary.response_Data) ? data.summary.response_Data : data.summary
                setSummaryArray(newData);
            } else {
                console.error('Failed to fetch survey');
            }
        } catch (error) {
            console.error('Error fetching survey:', error);
        } finally {
            setLoader(false);
        }
    };

    const generateCompetencyAverageReport = async (survey_id) => {
        try {

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
            // setLoader(false);
        }
    };

    const getChartImagesFromDB = async (surveyId) => {
        try {
            const url = `/api/images/chart-images/${surveyId}`; // Endpoint to get images
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
            });
            if (response.ok) {
                const images = await response.json();
                setSavedImages(images?.data);
            } else {
                console.error('Failed to retrieve chart images');
            }
        } catch (error) {
            console.error('Error retrieving chart images:', error);
        }
    };


    useEffect(() => {
        if (id) {
            getTotalParticipantsInvited(id);
            getSurvey(id)
            generateCompetencyAverageReport(id)
             generateSurveyReport(id, "Generate")
            getChartImagesFromDB(id)
           
        }
    }, []);
    useEffect(() => {
        if (competencyReport) {
            setTimeout(() => {
                GeneratePlans()           
            },2000)
        }
    }, [competencyReport,summaryArray]);
    console.log('competencyReport1',competencyReport)


    const Participants = ['Self', 'Direct Report', 'Teammate', 'Supervisor', 'Other'];

    const renderTableRows = (data) => {
        return Participants.map((Participant, index) => (
            <tr key={Participant} style={{ backgroundColor: index % 2 === 0 ? '#F2F8FB' : '#ffffff' }}>
                <td className="px-3 md:px-5 py-3 font-poppins">{Participant}</td>
                <td className="px-3 md:px-5 py-3 font-poppins text-center">{data?.totals?.[Participant] || 0}</td>
                <td className="px-3 md:px-5 py-3 font-poppins text-center">{data?.completedResponses?.[Participant] || 0}</td>
            </tr>
        ));
    };
    const totalInvited = Participants.reduce((acc, Participant) => acc + (totals[Participant] || 0), 0);
    const totalCompleted = Participants.reduce((acc, Participant) => acc + (completedResponses[Participant] || 0), 0);
    const renderCharts = () => {
        if (!reportData) return null;

        return Object.entries(reportData).map(([competency, data], index) => {
            // Skip rendering for "Uncategorized"
            if (competency === "Uncategorized") {
                return null;
            }
    
            // Render the ChartBar component for other competencies
            return (
                chart2Data[competency] && (
                    <ChartBar
                        key={competency}
                        getChartImagesFromDB={getChartImagesFromDB}
                        savedImages={savedImages?.summaries_by_competency?.[0]}
                        images={images}
                        survey_id={id}
                        index={index}
                        competency={competency}
                        data={data}
                        chart2Data={chart2Data[competency]}
                        reportData={reportData}
                        pdf={pdf}
                    />
                )
            );
        });
    };


    const renderCharts2 = () => {
        if (!reportData) {
            return null;
        } else {
            return <CompetencyBar data={reportData} getChartImagesFromDB={getChartImagesFromDB} pdf={pdf} savedImages={savedImages} survey_id={id} />
        }
        // 
    };

    const ReGenerateReport = () => {
        setLoader(true)
        generateSurveyReport(id, "ReGenerate")

    }

    const generatePdf = () => {
        setPdf(true);
        console.log('survey',survey)
        const loop_lead_name = `${survey?.loop_lead?.first_name}_${survey?.loop_lead?.last_name}`;
        const company_name = survey?.organization?.name || "Unknown Company"; // Fallback in case `company_name` is not available
        const survey_id = survey?._id || "UnknownID";
        const current_date = new Date().toLocaleDateString('en-GB').split('/').join('-'); // Format date as DD-MM-YYYY
        
        // Create file name
        const file_name = `${loop_lead_name}_${company_name}_${survey_id}_survey_report.pdf`.toLowerCase();
        setTimeout(() => {// Set the state to indicate PDF generation is in progress
            const element = reportRef.current; // Reference to the component you want to convert to PDF
            const options = {
                margin: [5, 5, 5, 5], // Adjust margins as needed
                filename: file_name,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { after: '.page-break' }
            
            };
    
            // Generate the PDF
            html2pdf()
                .from(element)
                .set(options)
                .toPdf()
                .get('pdf')
                .save()
                .then(() => {
                    setPdf(false); // Reset the PDF generation state after saving
                })
                .catch((error) => {
                    console.error("Error generating PDF:", error);
                    setPdf(false); // Reset state in case of error
                });
        },2000)
    };

    useEffect(() => {
        if (!loader) {
            renderCharts()
            renderCharts2()
        }
    }, [pdf])

    return (
        <AuthLayout title={"Survey Summary"}>
            <div className="main-back-heading">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 p-0">
                            <div className="profile-btns pt-0">
                                <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                                    Back
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="survey-inner survey_pdf relative">
                {!loader ? (
                    <Container>

                        <div className="d-flex justify-content-end pt-4 pb-3">
                            {/* {user.role =="looped_lead" && <Link  className='default-btn'  to={`/plans/${id}`}>Add a smart goals</Link>} */}
                            {user.role == "looped_lead" && <Button className="survey-inner-btn" onClick={() => { navigate(`/plans/${id}`) }}>Add a smart goals</Button>}

                            <Button className="survey-inner-btn absolute" onClick={() => { ReGenerateReport() }}>Re-Generate</Button> 
                                {!pdf ? <Button className="generate-btn" disabled={document.readyState === 'complete'?false:true} onClick={() => { generatePdf() }}>Download as PDF</Button>:
                                <Button className="survey-inner-btn absolute"><Spinner/></Button>}
                        </div>


                        <div className="survey-container" ref={reportRef}>

                            <div className="pdfContent">
                                <h2 className="font-frank mb-2" style={{ color: '#174A6D', fontSize: '33px' }}>
                                    LOOP3D 360 Report
                                </h2>
                                <p className="font-poppins" style={{ fontSize: '20px', color: '#174A6D' }}>
                                    <strong className="fw-normal font-frank" style={{ color: '#000' }}>Participant Name:</strong> {survey?.loop_lead?.first_name}
                                </p>
                                <p className="mb-2 font-poppins" style={{ fontSize: '20px', color: '#174A6D' }}>
                                    <strong className="fw-normal font-frank" style={{ color: '#000' }}>Report Generation Date:</strong> {formatDateGB(survey?.createdAt)}
                                </p>
                                <p className="mt-4 mb-4">
                                    Welcome to your personalized 360° feedback report customized to gather insight into your leadership strengths and opportunities. The data is gathered from coworkers you selected and the measures are based on competencies specific to your role. The purpose is to evaluate self-perception on these competencies and the perception of your respondents. Keep in mind that this report measures frequency of application of these behaviors or competencies.
                                </p>
                                <h3 className="fw-normal font-frank" style={{ fontSize: '25px', lineHeight: '30px', color: '#000' }}>
                                    Total number of responses:
                                </h3>
                                {loader ? (
                                    <p>Loading...</p>
                                ) : (
                                    <div className="overflow-x-auto mt-4 page-break" style={{ boxShadow: '0 0 10px #ddd', borderRadius: '0 0 10px 10px' }}>
                                        <table className="w-100">
                                            <thead>
                                                <tr>
                                                    <th className="bg-custom-color px-3 md:px-5 py-4 text-left font-poppins text-white" style={{ borderRadius: '10px 0 0 0' }}>Relationship</th>
                                                    <th className="bg-custom-color px-3 md:px-5 py-4 text-center font-poppins text-white font-normal border-none">Participants Invited</th>
                                                    <th className="bg-custom-color px-3 md:px-5 py-4 text-center font-poppins text-white font-normal border-none" style={{ borderRadius: '0 10px 0 0' }}>Completed Responses</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {renderTableRows({ completedResponses, totals })}
                                                <tr>
                                                    <td className="px-3 md:px-5 py-4 font-poppins">Total</td>
                                                    <td className="px-3 md:px-5 py-4 font-poppins text-center">{totalInvited}</td>
                                                    <td className="px-3 md:px-5 py-4 font-poppins text-center">{totalCompleted}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="pdfContent page-break">

                                <div className="participants_bg " style={{ backgroundColor: '#174A6D', padding: "50px 30px", marginTop: '25px' }}>
                                    <div className="row">
                                        <div className="col-md-12 col-lg-6">
                                            <h3 className="text-white font-frank fw-normal" style={{ fontSize: '20px' }}>
                                                Here are the participants that you invited:
                                            </h3>
                                            <ul className="mt-3 pl-4 sm:pl-6">
                                                {participants?.map((participant) => (
                                                    <li className="list-disc text-white font-poppins" style={{ fontSize: '14px', lineHeight: '30px' }} key={participant._id}>
                                                        {`${participant?.p_first_name} ${participant?.p_last_name} (${participant?.p_type})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="col-md-12 col-lg-6">
                                            <h3 className="text-white font-frank fw-normal margin_top" style={{ fontSize: '20px' }}>
                                                Here are the competencies that your manager selected as the most important to your role.
                                            </h3>
                                            <ul className="mt-3 pl-4 sm:pl-6">
                                                {survey?.competencies?.map((competency) => (
                                                    <li className="list-disc text-white font-poppins" style={{ fontSize: '14px', lineHeight: '30px' }} key={competency._id}>
                                                        {competency?.category_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="summary_graph_top page-break" style={{ backgroundColor: '#F5F5F5', padding: '10px 30px' }}>



                                    <p className="font-frank mt-4" style={{ fontSize: '25px', lineHeight: '30px' }}>
                                        Summary of your results:
                                    </p>

                                    <div className="top-strengths">
                                        <h3 className="text-custom-color fw-semibold mt-3" style={{ fontSize: '18px' }} >Top Strengths:</h3>
                                        <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-1 mb-2">
                                            {competencyReport?.topStrength}
                                        </p>

                                        <h3 className="text-custom-color fw-semibold" style={{ fontSize: '18px' }} >Top Developmental Opportunities:</h3>
                                        <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-1 mb-2">
                                            {competencyReport?.developmentalOpportunity}
                                        </p>
                                    </div>

                                    {/* graph box */}
                                    <div className="graph-box mt-3 mb-4" style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                                        {renderCharts2()}
                                    </div>


                                </div>

                            </div>


                            <div className="participant-name-looped-360">

                                <div className="participants_bg " style={{ backgroundColor: '#174A6D', padding: "20px 30px" }}>
                                    <h2 className="text-white font-frank fw-normal" style={{ fontSize: '25px' }}>
                                        Summaries by Competency
                                    </h2>
                                    <div page-break>{renderCharts()}</div>
                                </div >

                            </div>

                            <div className="chat-gpt-summary">



                                {summaryArray && (
                                    <>
                                        {/* Strengths and Skills */}

                                        <div className="pdfContent page-break">
                                            <h3 className={`text-custom-color font-frank fw-medium `} style={{ marginTop: pdf ? '150px' : '48px', fontSize: '25px', lineHeight: '40px' }}>
                                                Open-Ended Comments
                                            </h3>
                                            <p className="font-poppins mb-2">
                                                Here are the competencies that your manager selected as the most important to your role...
                                            </p>

                                            <div className="summary-item mt-4" style={{ backgroundColor: '#F2F8FB', padding: '30px 20px' }}>
                                                <h2 className="font-frank text-black" style={{ fontSize: '21px', lineHeight: '27px' }}> Q1. What are the strengths and skills that make this person most effective?</h2>
                                                {/* <p className="font-poppins fw-normal" style={{ fontSize: '16px' }}><strong c lassName="font-frank fw-medium" style={{ fontSize: '16px' }}>Total Summary:</strong> Example summary.</p> */}
                                                {summaryArray?.question_summary?.strengthsAndSkills?.map((item, index) => (
                                                    <p key={index}><strong className="font-frank fw-normal" style={{ fontSize: '18px' }}>{item.role}:</strong> {item.summary}</p>
                                                ))}
                                            </div>

                                        </div>

                                        <div className="pdfContent page-break">
                                            {/* Suggestions for Improvement */}
                                            <div className="summary-item" style={{backgroundColor: '#F2F8FB', padding: '30px 20px' }}>
                                                <h2 className="font-frank text-black" style={{ fontSize: '21px', lineHeight: '27px' }}>Q2. What suggestions do you have to make this person a stronger performer and more effective?</h2>
                                                {/* <p className="font-poppins" style={{ fontSize: '16px' }}> <strong className=" font-frank fw-normal" style={{ fontSize: '16px' }}>Total Summary:</strong> Example summary.</p> */}
                                                {summaryArray?.question_summary?.suggestionsForImprovement?.map((item, index) => (
                                                    <p key={index}><strong className="font-frank fw-normal" style={{ fontSize: '18px' }}>{item.role}:</strong> {item.summary}</p>
                                                ))}
                                            </div>
                                        </div>

                                        {(summaryArray?.question_summary?.otherComments && summaryArray?.question_summary?.otherComments.length > 0)&&
                                            <div className="pdfContent">

                                                {/* Other Comments */}
                                                <div className="summary-item  page-break" style={{ backgroundColor: '#F2F8FB', padding: '30px 20px' }}>
                                                    <h2 className="font-frank text-black" style={{ fontSize: '21px', lineHeight: '27px' }}>Q3. Other comments?</h2>
                                                    {/* <p className="font-poppins" style={{ fontSize: '20px' }}> <strong className=" font-frank fw-normal" style={{ fontSize: '25px' }}>Total Summary:</strong> Example summary.</p> */}
                                                    {summaryArray?.question_summary?.otherComments?.map((item, index) => (
                                                        <p key={index}><strong className="font-frank fw-normal" style={{ fontSize: '18px' }}>{item.role}:</strong> {item.summary}</p>
                                                    ))}
                                                </div>
                                            </div>}

                                    </>
                                )}
                            </div>
                            {summaryArray && (
                                <div className="summary-item chat-smart-goal" style={{ backgroundColor: '#F2F8FB', padding: '50px 20px' }}>
                                    <div className="pdfContent">
                                        <div className="summary-section summary-inner-text">
                                            <h3 className="font-frank text-custom-color" style={{ fontSize: '25px', lineHeight: '40px' }}>
                                                LOOP3D SMART Action Plan
                                            </h3>
                                            <p className="font-poppins text-black" style={{ fontSize: '16px' }}>
                                                This report is designed to highlight both strengths and developmental opportunities for you within your role.
                                            </p>

                                            <div className="summary_inner_box page-break" style={{ backgroundColor: '#fff', padding: '25px 30px', borderRadius: '10px' }}>
                                                <h3 className="font-frank text-black" style={{ fontSize: '25px', lineHeight: '40px' }}>Strengths</h3>
                                                <p className="font-poppins" style={{ fontSize: '16px' }}>
                                                    <strong className="font-frank fw-normal" style={{ fontSize: '20px', paddingBottom: '0' }}>Summary:</strong> Based on your results, your coworkers particularly appreciate the following strengths in you and the value it adds to the workplace.
                                                </p>

                                                <h4 className="font-frank fw-normal" style={{ fontSize: '20px' }}>SMART Plan:</h4>
                                                {summaryArray?.smart_plan?.map((plan, index) => (
                                          plan?.split(/(?=\d+\.\s)/).map((part, partIndex) => (
                                            part.trim() && !/^\d+$/.test(part.trim()) ? ( // Ensure the part is not just a number
                                                <p key={`${index}-${partIndex}`} style={{ fontSize: '16px' }}>
                                                    {part.trim()}
                                                </p>
                                            ) : null // Don't render if it's empty or just a number
                                        ))
                                                    ))}
                                                </div>
                                        </div>
                                    </div>
                                    <div className="pdfContent">
                                    <div className="summary-section summary-inner-text" style={{ backgroundColor: '#fff', padding: '35px 30px', borderRadius: '10px' }}>
                                        <h3 className="font-frank text-black" style={{ fontSize: '25px', lineHeight: '40px', textTransform: 'capitalize' }}>Development Opportunities</h3>
                                        <p className="font-poppins" style={{ fontSize: '16px' }}>
                                            <strong className="font-frank fw-normal" style={{ fontSize: '20px', paddingBottom: '0' }}>Summary:</strong> Based on your results, your coworkers have identified potential areas for development to further enhance your skills.
                                        </p>

                                        <h4 className="font-frank fw-normal" style={{ fontSize: '20px' }}>SMART Plan:</h4>
                                        {summaryArray?.smart_plan_opportunities?.map((plan, index) => {
                                            // Split the plan string by points (e.g., "1.", "2.", etc.)
                                            const splitPlan = plan?.split(/(?=\d\.\s)/); // Use regex to split on numbers followed by a period and space
                                            return (
                                                <div key={index}>
                                                    {splitPlan.map((point, idx) => (
                                                        <p key={idx} style={{ fontSize: '16px' }}>{point.trim()}</p> // Trim whitespace from each point
                                                    ))}
                                                </div>

                                            );
                                        })}
                                    </div>
                                    </div>
                                </div>
                            )}
                    
                        </div>
                        {summaryArray?.summary_video_id && <div id="video-container" style={{ width: '100%', marginTop: "-42px", backgroundColor: '#F2F8FB', padding: '30px 20px', textAlign: 'center', height: 'auto', borderRadius: '0 0 30px 30px' }}>
                            <iframe
                                src={`https://share.synthesia.io/embeds/videos/${summaryArray?.summary_video_id}`}
                                loading="lazy"
                                title="Synthesia Video"
                                allowFullScreen
                                allow="encrypted-media; fullscreen;"
                                style={{ width: '100%', maxWidth: '500px', height: '400px', border: 'none' }}  // Ensure this is an object, not a string
                            ></iframe>
                            <div style={{ margin: '15px 0' }}>
                                {!pdf ? <Button className="generate-btn" disabled={document.readyState === 'complete' ? false : true} onClick={() => { generatePdf() }}>Download</Button> :
                                    <Button className="survey-inner-btn absolute"><Spinner /></Button>}
                            </div>
                        </div>}
                        
                    </Container>
                ) : <div style={{ textAlign: "center", marginTop: "15%" }}><Loading /></div>
                }

            </div>
        </AuthLayout>

    );
};

export default SurveySummary;
