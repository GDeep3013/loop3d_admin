import React from 'react'
import { formatDateGB } from '../../utils/dateUtils'
import ChartBar from "./ChartBar"
import CompetencyBar from "./CompetencyBar"
const SummaryPdf = ({reportRef,completedResponses, totals, reportData, participants, competencyReport, survey, loader, renderTableRows, totalInvited, totalCompleted, summaryArray }) => {
    const renderCharts = () => {
        if (!reportData) return null;

        return Object.entries(reportData).map(([competency, data]) => (
            <ChartBar key={competency} competency={competency} data={data} reportData={reportData} pdf={true} />
        ));
    };


    const renderCharts2 = () => {
        if (!reportData) {
            return null;
        } else {
            return <CompetencyBar data={reportData} pdf={true}  />
        }
        // 
    };
    return (
        reportData && (<div className="survey-container" ref={reportRef}>
    <h2 className="font-frank mb-4" style={{ color: '#174A6D', fontSize: '48px' }}>
        LOOP3D 360 Report
    </h2>
    <div className="participant-name-looped-360 mt-4">
        <p className="mb-4 font-poppins" style={{ fontSize: '25px', color: '#174A6D' }}>
            <strong className="fw-normal font-frank" style={{ color: '#000' }}>Participant Name:</strong> {survey?.loop_lead?.first_name}
        </p>
        <p className="mb-4 font-poppins" style={{ fontSize: '25px', color: '#174A6D' }}>
            <strong className="fw-normal font-frank" style={{ color: '#000' }}>Report Generation Date:</strong> {formatDateGB(survey?.createdAt)}
        </p>
        <p className="mt-4 mb-4">
            Welcome to your personalized 360° feedback report customized to gather insight into your leadership strengths and opportunities. The data is gathered from coworkers you selected and the measures are based on competencies specific to your role. The purpose is to evaluate self-perception on these competencies and the perception of your respondents. Keep in mind that this report measures frequency of application of these behaviors or competencies.
        </p>
        <p className="mb-4">
            <strong className="fw-normal font-frank" style={{ fontSize: '48px', lineHeight: '50px', color: '#000' }}>About Your Report</strong>
        </p>
        <h3 className="fw-normal font-frank" style={{ fontSize: '35px', lineHeight: '30px', color: '#000' }}>
            Total number of responses:
        </h3>
        {loader ? (
            <p>Loading...</p>
        ) : (
            <div className="overflow-x-auto mt-4" style={{ boxShadow: '0 0 10px #ddd', borderRadius: '0 0 10px 10px' }}>
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

        <p className="font-poppins text-black" style={{ fontSize: '18px', lineHeight: '30px', marginTop: '25px' }}>*Please note that we need a minimum of two respondents (other than self or manager) to maintain anonymity. If less than 2 is reported in any category, they will be combined with another category. </p>

        <div className="participants_bg" style={{ backgroundColor: '#174A6D', padding: "50px 30px", marginTop: '25px' }}>
            <div className="row">
                <div className="col-md-12 col-lg-6">
                    <h3 className="text-white font-frank fw-normal" style={{ fontSize: '25px' }}>
                        Here are the participants that you invited:
                    </h3>
                    <ul className="pl-4 sm:pl-6">
                        {participants?.map((participant) => (
                            <li className="list-disc text-white font-poppins" style={{ fontSize: '18px', lineHeight: '38px' }} key={participant._id}>
                                {`${participant?.p_first_name} ${participant?.p_last_name} (${participant?.p_type})`}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-md-12 col-lg-6">
                    <p className="text-white font-frank mb-4" style={{ fontSize: '25px' }}>
                        Here are the competencies that your manager selected as the most important to your role...
                    </p>
                    <ul className="pl-4 sm:pl-6">
                        {survey?.competencies?.map((competency) => (
                            <li className="list-disc text-white font-poppins" style={{ fontSize: '18px', lineHeight: '38px' }} key={competency._id}>
                                {competency?.category_name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <div className="summary_graph_top" style={{ backgroundColor: '#F5F5F5', padding: '60px 30px' }}>
            <p className="font-frank mt-4 mb-4" style={{ fontSize: '48px', lineHeight: '50px' }}>
                Summary of your results:
            </p>
            {/* graph box */}
            <div className="graph-box mt-5 mb-5" style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                {renderCharts2()}
            </div>

            <h3 className="text-custom-color fw-semibold">Top Strengths:</h3>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                {competencyReport?.topStrength}
            </p>

            <h3 className="text-custom-color fw-semibold">Top Developmental Opportunities:</h3>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
                {competencyReport?.developmentalOpportunity}
            </p>
        </div>

        <div className="participants_bg" style={{ backgroundColor: '#174A6D', padding: "50px 30px" }}>
            <h2 className="text-white font-frank fw-normal">
                Summaries by Competency
            </h2>
            <div>{reportData && renderCharts()}</div>
        </div>
        <h3 className="text-custom-color font-frank fw-medium mt-4" style={{ fontSize: '48px', lineHeight: '50px' }}>
            Open-Ended Comments 
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
            Here are the competencies that your manager selected as the most important to your role...
        </p>
        <div className="chat-gpt-summary">
            {summaryArray && (
                <>
                    {/* Strengths and Skills */}
                    <div className="summary-item">
                        <h2 className="font-frank text-black" style={{ fontSize:'25px', lineHeight:'30px' }}> Q1. What are the strengths and skills that make this person most effective?</h2>
                        <p className="font-poppins fw-normal" style={{ fontSize:'20px' }}><strong className="font-frank fw-medium" style={{ fontSize:'25px' }}>Total Summary:</strong> Example summary.</p>
                        {summaryArray?.question_summary?.strengthsAndSkills?.map((item, index) => (
                            <p key={index}><strong className="font-frank fw-normal" style={{ fontSize:'25px' }}>{item.role}:</strong> {item.summary}</p>
                        ))}
                    </div>

                    {/* Suggestions for Improvement */}
                    <div className="summary-item" style={{ backgroundColor:'#F2F8FB', padding:'50px 20px' }}>
                        <h2 className="font-frank text-black" style={{ fontSize:'25px', lineHeight:'30px' }}>Q2. What suggestions do you have to make this person a stronger performer and more effective?</h2>
                        <p className="font-poppins" style={{ fontSize:'20px' }}><strong className="font-frank fw-normal" style={{ fontSize:'25px' }}>Total Summary:</strong> Example summary.</p>
                        {summaryArray?.question_summary?.suggestionsForImprovement?.map((item, index) => (
                            <p key={index}><strong className="font-frank fw-normal" style={{ fontSize:'25px' }}>{item.role}:</strong> {item.summary}</p>
                        ))}
                    </div>

                    {/* Other Comments */}
                    <div className="summary-item">
                        <h2 className="font-frank text-black" style={{ fontSize:'25px', lineHeight:'30px' }}>Q3. Other comments?</h2>
                        <p className="font-poppins" style={{ fontSize:'20px' }}><strong className="font-frank fw-normal" style={{ fontSize:'25px' }}>Total Summary:</strong> Example summary.</p>
                        {summaryArray?.question_summary?.otherComments?.map((item, index) => (
                            <p key={index}><strong className="font-frank fw-normal" style={{ fontSize:'25px' }}>{item.role}:</strong> {item.summary}</p>
                        ))}
                    </div>

                   
                </>
            )}
        </div>
        {summaryArray && (
            <div className="summary-item chat-smart-goal" style={{ backgroundColor: '#F2F8FB', padding: '50px 20px' }}>
                <div className="summary-section summary-inner-text">
                <h3 className="font-frank text-custom-color" style={{ fontSize: '48px', lineHeight: '50px' }}>
                    LOOP3D SMART Action Plan
                </h3>
                <p className="font-poppins text-black" style={{ fontSize: '18px' }}>
                    This report is designed to highlight both strengths and developmental opportunities for you within your role.
                </p>

                <div className="summary_inner_box" style={{ backgroundColor: '#fff', padding: '35px 30px', borderRadius: '10px' }}>
                    <h3 className="font-frank text-black" style={{ fontSize: '35px', lineHeight: '40px' }}>Strengths</h3>
                    <p className="font-poppins" style={{ fontSize: '20px' }}>
                    <strong className="font-frank fw-normal" style={{ fontSize: '20px' }}>Summary:</strong> Based on your results, your coworkers particularly appreciate the following strengths in you and the value it adds to the workplace.
                    </p>

                    <h4 className="font-frank fw-normal" style={{ fontSize: '20px' }}>SMART Plan:</h4>
                    {summaryArray?.smart_plan?.map((plan, index) => (
                    <p key={index}>{plan}</p>
                    ))}
                </div>
                </div>

                <div className="summary-section summary-inner-text mt-5" style={{ backgroundColor: '#fff', padding: '35px 30px', borderRadius: '10px' }}>
                <h3 className="font-frank text-black" style={{ fontSize: '35px', lineHeight: '40px', textTransform: 'capitalize' }}>Development Opportunities</h3>
                <p className="font-poppins" style={{ fontSize: '20px' }}>
                    <strong className="font-frank fw-normal" style={{ fontSize: '20px' }}>Summary:</strong> Based on your results, your coworkers have identified potential areas for development to further enhance your skills.
                </p>

                <h4 className="font-frank fw-normal" style={{ fontSize: '20px' }}>SMART Plan:</h4>
                {summaryArray?.smart_plan_opportunities?.map((plan, index) => {
                    // Split the plan string by points (e.g., "1.", "2.", etc.)
                    const splitPlan = plan?.split(/(?=\d\.\s)/); // Use regex to split on numbers followed by a period and space
                    return (
                    <div key={index}>
                        {splitPlan.map((point, idx) => (
                        <p key={idx}>{point.trim()}</p> // Trim whitespace from each point
                        ))}
                    </div>
                    );
                })}
                </div>
            </div>
            )}
    </div>
</div>)
  )
}

export default SummaryPdf;
