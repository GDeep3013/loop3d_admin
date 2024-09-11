

const sendLoopLeadLink = (recipientDetails) => {
  return {
    from: 'sahil.610weblab@gmail.com',
    to: recipientDetails.email,
    subject: 'Loop3D 360 Feedback Process - Launch',
    text: `${recipientDetails.name}

      You've been nominated by your organization to participate in the Loop3D 360 Feedback Program. Congratulations! This means your organization is supportive of your development. This is an opportunity for you to gain a deeper understanding of your leadership style and impact by gathering feedback directly from the people (raters) you work with every day.

      The feedback report will provide insight into:
      - Your leadership style
      - Gaps and similarities of competency assessments between yourself and other co-workers
      - Customized coaching with strategies for professional development

      You will be provided the opportunity to receive feedback by your co-workers by nominating them via the link below. Choose individuals who will provide honest and candid feedback about your knowledge, skills, and abilities. You will need a minimum of 10 nominees, but keep in mind that your feedback data becomes more robust as you increase the number of nominees.

      Get started by clicking on the following link:
      ${recipientDetails.url}

      Simply respond to this email if you have any questions at all about the process.

      Thanks!
      The Loop3D Team`,
    html: `
     <p><strong>${recipientDetails.name}</strong>,</p>
    <p>You've been nominated by your organization to participate in the Loop3D 360 Feedback Program. Congratulations! This means your organization is supportive of your development. This is an opportunity for you to gain a deeper understanding of your leadership style and impact by gathering feedback directly from the people (raters) you work with every day.</p>
    
    <p>The feedback report will provide insight into:</p>
    <ul>
      <li>Your leadership style</li>
      <li>Gaps and similarities of competency assessments between yourself and other co-workers</li>
      <li>Customized coaching with strategies for professional development</li>
    </ul>

    <p>You will be provided the opportunity to receive feedback from your co-workers by nominating them via the link below. Choose individuals who will provide honest and candid feedback about your knowledge, skills, and abilities. You will need a minimum of 10 nominees, but keep in mind that your feedback data becomes more robust as you increase the number of nominees.</p>
    
    <p>Get started by clicking on the following link:</p>
    <p><a href="${recipientDetails.url}">Link</a></p>
    
    <p>Simply respond to this email if you have any questions at all about the process.</p>
    
    <p>Thanks!<br/>
    The Loop3D Team</p>
        `
  };
};

module.exports = { sendLoopLeadLink };
