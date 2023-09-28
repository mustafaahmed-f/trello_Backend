import nodemailer from 'nodemailer'

const sendEmail = async({user=process.env.EMAIL , pass=process.env.EMAIL_PASSWORD , from , to , subject , text , attachments , html}={})=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user,
          pass
        }
      });
    
      const info = await transporter.sendMail({
        from:`"Mustaf King" <${from}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        attachments,
        html, // html body
      });

}

export default sendEmail


