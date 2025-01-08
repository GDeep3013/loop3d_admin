
const emailHeaderFooter = require('./emailHeaderFooter');

const completionEmailtoManger = (recipientDetails) => {
    const bodyContent=`<tr>
                            <td>
                                <p>Thank you for your support in the development of [LOOP3D Lead]. The
                        feedback collection process is complete for [LOOP3D Lead] and a copy of their
                        LOOP3D 360 Feedback Report has been emailed to them. We encourage you
                        to schedule follow up meetings to discuss key themes and findings in the
                        report, while also continuing with their ongoing development. We also
                        recommend conducting another LOOP3D 360 Feedback process 2-3 months
                        from now to measure behavioral change and development of your leaders.</p>                 
                            </td>
                        </tr>`
    return {
        from: 'LOOP3D <aaron.loop360@gmail.com>', 
        to: recipientDetails.email,
        subject: 'LOOP3D 360 Process - [LOOP3D Lead full name] - Complete',
        html: emailHeaderFooter(bodyContent)
    };
};

module.exports = { completionEmailtoManger };
