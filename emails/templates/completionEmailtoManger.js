

const completionEmailtoManger = (recipientDetails) => {
    return {
        from: 'sahil.610weblab@gmail.com',
        to: recipientDetails.email,
        subject: 'Loop3D 360 Process - [Loop3D Lead full name] - Complete',
        text: `
        
        
        Thank you for your support in the development of [Loop3D Lead]. The
        feedback collection process is complete for [Loop3D Lead] and a copy of their
        Loop3D 360 Feedback Report has been emailed to them. We encourage you
        to schedule follow up meetings to discuss key themes and findings in the
        report, while also continuing with their ongoing development. We also
        recommend conducting another Loop3D 360 Feedback process 2-3 months
        from now to measure behavioral change and development of your leaders.`,
        html: `



            <p>Thank you for your support in the development of [Loop3D Lead]. The
            feedback collection process is complete for [Loop3D Lead] and a copy of their
            Loop3D 360 Feedback Report has been emailed to them. We encourage you
            to schedule follow up meetings to discuss key themes and findings in the
            report, while also continuing with their ongoing development. We also
            recommend conducting another Loop3D 360 Feedback process 2-3 months
            from now to measure behavioral change and development of your leaders.</p>
          `
    };
};

module.exports = { completionEmailtoManger };
