
import { Container } from "react-bootstrap";
import StartSurveyFrom from "./StartSurveyFrom";
import AuthLayout from '../../../layout/Auth';
const StartSurvey = () => {
  return (
    <AuthLayout title={"Surveys"}>
    <Container className="">
      <div className="survey_box">
        <h1 className="">Start Survey</h1>
        <StartSurveyFrom />
      </div>
      </Container>
</AuthLayout>
  );
};

export default StartSurvey;
