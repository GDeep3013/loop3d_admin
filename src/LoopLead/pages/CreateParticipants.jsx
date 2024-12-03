import React, { useState, useEffect } from "react";
import { Container, Dropdown, Row, Col ,Button} from 'react-bootstrap';
import ParticipantForm from './ParticipantForm'
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/Auth";
import { useSelector } from 'react-redux';

const CreateParticipants = () => {
    const user = useSelector((state) => state.auth.user);
const navigate=useNavigate()
    const { id } = useParams();

    const [survey, setSurvey] = useState();
    const getSurvey = async (id) => {
        try {
            const url = `/api/surveys?survey_id=${id}`;
            const response = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                setSurvey(data?.data?.[0])

            } else {
                console.error('Failed to fetch assignments');
                return false;
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            return false;
        }
    };

    useEffect(() => {

        if (id) {
            getSurvey(id);
        }

    }, [id]);

    return (
        <AuthLayout title={"Create Participant"}>
            <div>
                <div className="profile-btns pt-4">
                                    <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                                        Back
                                    </Button>                               
                </div>
                <div className="lunchpad pt-4 pt-md-5 pb-5">
                    <Container>                
                        <div className="d-flex flex-column flex-lg-row gap-lg-5 gap-3">
                            <div className="w-100 w-lg-50">
                                <h2 className="text-dark fs-1 fs-lg-3 fw-bold heading-font">Loop3d Launchpad</h2>
                                <p className="fs-6 lh-lg text-dark mw-100 mw-lg-75 mt-3 mt-lg-0">
                                    Welcome! Use this page to enter the email addresses for everyone who you would like to take the survey. Please note that your email and your manager's email are required along with a minimum of 10 other raters.
                                </p>
                                <div className="teammate mt-3 mt-lg-5 py-3 px-3 rounded">
                                    <p className="text-dark fs-6 lh-lg mt-1">
                                        <strong className="text-custom-color fw-bold">Teammate -</strong> People on your team and level who report to the same supervisor.
                                    </p>
                                    <p className="text-dark fs-6 lh-lg mt-1">
                                        <strong className="text-custom-color fw-bold">Direct Reports -</strong> People who report directly into you
                                    </p>
                                    <p className="text-dark fs-6 lh-lg mt-1">
                                        <strong className="text-custom-color fw-bold">Other -</strong> Includes customers, clients, vendors, etc. whom you regularly work with.
                                    </p>
                                </div>
                            </div>


                            <div className="w-100 w-lg-50">
                                <h2 className="text-dark fs-4 fs-lg-5 fw-bold">Step 1:</h2>
                                <p className="fs-6 lh-lg text-dark mw-100 mw-lg-75 mt-2 mt-lg-0">
                                    Enter your email address and your manager's email address
                                </p>

                                <form method="post" className="mt-3 mt-lg-4">
                                    <div className="mb-3">
                                        <label className="mb-2">Manager's Email</label>
                                        <input placeholder="First Name" type="email" name="employee_email" value={survey?.manager?.email} disabled required className="form-control text-dark fs-6 rounded-3 py-2 px-3" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="mb-2">Email</label>
                                        <input placeholder="First Name" type="email" name="employee_email" value={survey?.loop_lead?.email} disabled required className="form-control text-dark fs-6 rounded-3 py-2 px-3" />
                                    </div>
                                </form>

                                <h2 className="text-dark fs-4 fs-lg-5 fw-bold mt-3 mt-lg-4">Competencies:</h2>
                                <ul className="ps-3 ps-lg-4 mt-2">
                                    {survey?.competencies?.map((competency) => (
                                        <li className="fs-6 lh-lg text-dark mt-2" key={competency._id}>
                                            {competency?.category_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </Container>
                </div>
                <ParticipantForm survey_id={id} />
            </div>
        </AuthLayout>
    );
};

export default CreateParticipants;
