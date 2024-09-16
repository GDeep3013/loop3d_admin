import React, { useState, useEffect } from 'react'
import { Container } from "react-bootstrap";
import AuthLayout from '../../layout/Auth';

// import Container from "../components/common/Container";
import { useParams } from 'react-router-dom';
// import { formatDateGB } from '../utils/dateUtils'
// import ChartBar from "../components/survey-summary/ChartBar"
// import CompetencyBar from "../components/survey-summary/CompetencyBar"

export default function SurveySummary() {
    const searchParams = useParams();
    const survey_id = '66e42a131cd0c5d9c68398f2';

    const [completedResponses, setCompletedResponses] = useState({});
    const [totals, setTotals] = useState({});
    const [loader, setLoader] = useState(true);
    const [survey, setSurvey] = useState();
    const [reportData, setReportData] = useState();
    const [participants, setParticipants] = useState();
    const[competencyReport, setCompetencyReport]= useState();


    const getSurvey = async (survey_id) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/surveys?survey_id=${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
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

            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/surveys/participants/invited/${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
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

            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/surveys/generate-report/${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                // console.log('datadata',data?.report?.categories)
                setReportData(data?.report?.categories|| {});
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

            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/surveys/generate-competency-average/${survey_id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                setCompetencyReport(data|| {});
            } else {
                console.error('Failed to fetch survey');
            }
        } catch (error) {
            console.error('Error fetching survey:', error);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        if (survey_id) {
            getTotalParticipantsInvited(survey_id);
            getSurvey(survey_id)
            generateSurveyReport(survey_id)
            generateCompetencyAverageReport(survey_id)
        }
    }, [survey_id]);

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
            // <ChartBar key={competency} competency={competency} data={data} />
            console.log(competency)
        ));
    };

  

    const renderCharts2 = () => {
        if (!reportData) {
            return null;
        } else {
            // return <CompetencyBar data={reportData} /> 
        }

            
        
        // 
    };

 
    const totalInvited = Participants.reduce((acc, Participant) => acc + (totals[Participant] || 0), 0);
    const totalCompleted = Participants.reduce((acc, Participant) => acc + (completedResponses[Participant] || 0), 0);
    return (
        <AuthLayout title={"SurveySummary"}>
         <div className="survey-inner pt-5 pb-5 pb-md-5 pb-lg-2">
                <Container>
                    
                 <div className="survey-container p-3 p-md-4 p-lg-5 m-auto rounded bg-light w-100">
                     <h2 className="text-black h4 h-md-3 h-lg-2 text-center mb-3 font-frank">
                         LOOP3D 360 Report
                     </h2>
                     <div className="participant-name-looped-360 mt-3">
                         <p className="small mb-3">
                             <strong className="text-dark fw-bold">Participant Name:</strong> Sandeep Rathour
                         </p>
                         <p className="small mb-3">
                             <strong className="text-dark fw-bold">Report Generation Date:</strong> August 30, 2024
                         </p>
                         <p className="small mb-3 text-muted">
                             Welcome to your personalized 360° feedback report customized to gather insight into your leadership strengths and opportunities. The data is gathered from coworkers you selected and the measures are based on competencies specific to your role. The purpose is to evaluate self-perception on these competencies and the perception of your respondents. Keep in mind that this report measures frequency of application of these behaviors or competencies.
                         </p>
                         <p className="small mb-3">
                             <strong className="text-dark fw-bold">About Your Report</strong>
                         </p>
                         <h3 className="text-custom-color h5 fw-bold">
                             Total number of responses:
                         </h3>


                         <div className="table-responsive">
                             <table className="table table-bordered w-100 text-sm">
                                 <thead>
                                     <tr>
                                         <th className="bg-custom-color px-2 py-2 text-start text-white border-white">Relationship</th>
                                         <th className="bg-custom-color px-2 py-2 text-start text-white border-white">Participants Invited</th>
                                         <th className="bg-custom-color px-2 py-2 text-start text-white border-white">Completed Responses</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     <tr>
                                         <td className="px-2 py-2 border">Self</td>
                                         <td className="px-2 py-2 border">1</td>
                                         <td className="px-2 py-2 border">0</td>
                                     </tr>
                                     <tr>
                                         <td className="px-2 py-2 border">Direct Reports</td>
                                         <td className="px-2 py-2 border">0</td>
                                         <td className="px-2 py-2 border">0</td>
                                     </tr>
                                     <tr>
                                         <td className="px-2 py-2 border">Teammate</td>
                                         <td className="px-2 py-2 border">0</td>
                                         <td className="px-2 py-2 border">0</td>
                                     </tr>
                                     <tr>
                                         <td className="px-2 py-2 border">Supervisor</td>
                                         <td className="px-2 py-2 border">0</td>
                                         <td className="px-2 py-2 border">0</td>
                                     </tr>
                                     <tr>
                                         <td className="px-2 py-2 border">Other</td>
                                         <td className="px-2 py-2 border">0</td>
                                         <td className="px-2 py-2 border">0</td>
                                     </tr>
                                     <tr>
                                         <td className="px-2 py-2 fw-bold border">Total</td>
                                         <td className="px-2 py-2 fw-bold border">1</td>
                                         <td className="px-2 py-2 fw-bold border">0</td>
                                     </tr>
                                 </tbody>
                             </table>
                         </div>


                         <h3 className="text-custom-color h5 sm-h4 fw-bold">
                             Here are the participants that you invited:
                         </h3>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             Here are the competencies that your manager selected as the most important to your role (in no particular ranking order):
                         </p>
                         <ul className="ps-3 sm-ps-4">
                             <li className="list-disc text-gray-600">Coaches And Develops</li>
                             <li className="list-disc text-gray-600">Customer Oriented</li>
                             <li className="list-disc text-gray-600">Accountability</li>
                         </ul>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             Below is a summary of your results:
                         </p>

                  
                         <div className="graph-box mt-5 mb-5"></div>

                         <h3 className="text-custom-color h5 sm-h4 fw-bold">Top Strengths:</h3>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             Coaches And Develops
                         </p>

                         <h3 className="text-custom-color h5 sm-h4 fw-bold">Top Developmental Opportunities:</h3>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             Coaches And Develops
                         </p>

                         <h2 className="text-uppercase fw-bold text-custom-color h4 sm-h2">
                             Summaries by Competency
                         </h2>

                         <h3 className="text-custom-color h5 sm-h4 fw-bold text-uppercase">
                             Competency: Coaches And Develops
                         </h3>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             The customer oriented competency is the proactive and empathetic approach leaders take to understand, anticipate, and meet the needs of diverse stakeholders.
                         </p>

                         <div className="graph-box mt-5 mb-5"></div>

                         <h3 className="text-custom-color h5 sm-h4 fw-bold text-uppercase">
                             Competency: Customer Oriented
                         </h3>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             The customer oriented competency is the proactive and empathetic approach leaders take to understand, anticipate, and meet the needs of diverse stakeholders.
                         </p>


 
                         <div className="graph-box mt-5 mb-5"></div>

                         <h3 className="text-custom-color h4 sm-h3 md-h2 fw-bold text-uppercase">
                             COMPETENCY: Accountability
                         </h3>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             The customer oriented competency is the proactive and empathetic approach leaders take to understand, anticipate, and meet the needs of diverse stakeholders.
                         </p>

            
                         <div className="graph-box mt-5 mb-5"></div>

                         <h2 className="text-uppercase fw-bold text-custom-color h4 sm-h3 md-h2">
                             Open-Ended Comments
                         </h2>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             Below you can review a summary for each of the open-ended questions.
                         </p>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             1. What are the strengths and skills that make this person most effective?
                             <br className="d-none d-sm-block" />Self: The self-assessment highlighted strong communication and problem-solving skills.
                             <br className="d-none d-sm-block" />Direct Report: Direct reports noted the person's ability to motivate the team and foster collaboration, aligning with the self-assessment.
                             <br className="d-none d-sm-block" />Teammate: Teammates identified the individual's adaptability and willingness to help others, showing consistency with the self-perception.
                             <br className="d-none d-sm-block" />Supervisor: The supervisor emphasized the person's leadership qualities and strategic thinking, in line with the self-assessment.
                             <br className="d-none d-sm-block" />Other: Other respondents praised the individual's creativity and innovation, which was not explicitly mentioned in the self-assessment.
                         </p>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             2. What suggestions do you have to make this person a stronger performer and more effective?
                             <br className="d-none d-sm-block" />Self: The self-assessment did not provide specific suggestions for improvement.
                             <br className="d-none d-sm-block" />Direct Report: Direct reports recommended focusing on delegation and time management to improve efficiency, differing from the self-perception.
                             <br className="d-none d-sm-block" />Teammate: Teammates suggested enhancing conflict resolution skills and providing clearer direction, indicating areas for growth not acknowledged by the individual.
                             <br className="d-none d-sm-block" />Supervisor: The supervisor advised developing emotional intelligence and enhancing coaching abilities, highlighting areas for improvement not mentioned in the self-assessment.
                             <br className="d-none d-sm-block" />Other: Other respondents recommended building stronger relationships with stakeholders and enhancing networking skills, areas not explicitly addressed in the self-assessment.
                         </p>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             3. Other comments?
                             <br className="d-none d-sm-block" />Self: The self-assessment did not include additional comments.
                             <br className="d-none d-sm-block" />Direct Report: Direct reports expressed appreciation for the individual's support and open communication style.
                             <br className="d-none d-sm-block" />Teammate: Teammates highlighted the person's positive attitude and willingness to collaborate effectively.
                             <br className="d-none d-sm-block" />Supervisor: The supervisor commended the individual for their strategic contributions and strong work ethic.
                             <br className="d-none d-sm-block" />Other: Other respondents mentioned the person's impact on team morale and overall positive influence on the work environment.
                         </p>
                         <h2 className="text-uppercase fw-bold text-custom-color h4 sm-h3 md-h2">
                             LOOP3D SMART PLAN
                         </h2>
                         <p className="text-sm sm-text-base lh-lg text-gray-600 mt-4 mb-4">
                             This report is designed to highlight both strengths and developmental opportunities for you within your role.
                         </p>


                         <p className="text-sm sm-text-base lh-base text-gray-600 mb-4">
                             <strong className="text-dark font-weight-bold text-uppercase">STRENGTHS</strong>
                         </p>
                         <p className="text-sm sm-text-base lh-base text-gray-600 mb-4">
                             <strong className="text-dark font-weight-bold">Summary:</strong>
                             Based on your results, your coworkers particularly appreciate the following strengths in you and the value it adds to the workplace. Your top strengths include Accountability, Coaches And Develops, and Customer Oriented competencies, with the goal of further sharpening and enhancing your strengths.
                         </p>
                         <p className="text-sm sm-text-base lh-base text-gray-600 mb-4">
                             <strong className="text-dark font-weight-bold">SMART Plan:</strong>
                             Based on your results, our LOOP3D SMART Plan includes resources for you to start your development and continue building on your strengths. The following developmental suggestions are tailored to you and your role.
                             <br className="d-none d-sm-block" />
                             1. Develop and implement a training program for employees to improve customer service skills by Q3, resulting in a 10% increase in customer satisfaction ratings.
                             <br className="d-none d-sm-block" />
                             2. Establish a monthly feedback mechanism for team members to share ideas and concerns, aiming to increase employee engagement by 15% within the next six months.
                         </p>

                         <p className="text-sm sm-text-base lh-base text-gray-600 mb-4">
                             <strong className="text-dark font-weight-bold text-uppercase">DEVELOPMENT OPPORTUNITIES</strong>
                         </p>
                         <p className="text-sm sm-text-base lh-base text-gray-600 mb-4">
                             <strong className="text-dark font-weight-bold">Summary:</strong>
                             Based on your results, your coworkers particularly appreciate the following strengths in you and the value it adds to the workplace. Your top strengths include Top 3 competencies: Communication, Problem-solving, and Leadership.
                         </p>
                         <p className="text-sm sm-text-base lh-base text-gray-600 mb-4">
                             1. Develop communication skills by attending a public speaking course to improve presentation delivery; measurable outcome: increase audience engagement by 20% within 3 months.
                             <br className="d-none d-sm-block" />
                             2. Enhance problem-solving abilities through regular participation in brainstorming sessions; specific goal: contribute at least one innovative solution per session; achievable steps: research creative thinking techniques; relevance to role: foster team collaboration; timeline: implement within 1 month.
                         </p>
                         <p className="text-sm sm-text-base lh-base text-gray-600 mb-4">
                             <strong className="text-dark font-weight-bold">SMART Plan:</strong>
                             Based on your results, our LOOP3D SMART Plan includes resources for you to start your development plan and journey. The following developmental suggestions are tailored to you and your role.
                             <br className="d-none d-sm-block" />
                             1. Develop a training program on effective communication skills to enhance team collaboration, with a goal to improve team communication by 20% within 3 months.
                             <br className="d-none d-sm-block" />
                             2. Implement a monthly feedback session for team members to provide and receive constructive feedback, aiming to increase overall team satisfaction by 15% in 6 months.
                         </p>

                         <div className="text-center mt-4">
                             <a
                                 className="btn btn-primary rounded-pill px-4 py-2 text-white bg-info hover:bg-dark"
                                 href="/contact"
                             >
                                 Download PDF
                             </a>
                         </div>
                     </div>
                 </div>
             </Container>
         </div>
        

        </AuthLayout>

    )
}
