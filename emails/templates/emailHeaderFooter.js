const emailHeaderFooter = (bodyContent) => {
    return `
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
          <style type="text/css" media="screen">
              body { font-family: 'Roboto', sans-serif; }
              img { max-width: 100%; }
          </style>
      </head>
      <body style="padding:0 !important; margin:0 !important; display:block !important; min-width:100% !important; width:100% !important; background:#ffffff; -webkit-text-size-adjust:none;">
          <div class="wrapper" style="max-width: 850px; display: block; margin: auto; border: 1px solid #ddd;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="padding: 20px 50px;">
                  <tr>
                      <td style="text-align: center; text-decoration: underline;">
                          <img src="https://610weblab.in/design-link/loop3d-logo.png" alt="Loop3D Logo" height="30px" border="0" />
                      </td>
                  </tr>
                  ${bodyContent} 
              </table>
          </div>
      </body>
    </html>
    `;
  };
  
  module.exports = emailHeaderFooter;
  