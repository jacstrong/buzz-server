const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');

// Eventually need to set this up with rabbitMQ
// see https://github.com/nodemailer/nodemailer-amqp-example

// email-smtp.us-west-2.amazonaws.com

const getTransporter = async () => {  // Set this up with actual email account.
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: 'email-smtp.us-west-2.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log(process.env.NODE_ENV)
  return transporter
}

const confirmationTemp = fs.readFileSync(__dirname + '/confirmation.html', 'utf-8');
const compiledConfirmationTemp = handlebars.compile(confirmationTemp);

const accountConfirmation = async (userInfo) => {
  const transporter = await getTransporter()

  const replacements = {
    firstName: userInfo.firstName,
    confirmationID: userInfo.confirmationID,
    code: userInfo.code
  }

  const htmlToSend = compiledConfirmationTemp(replacements);

  let info = await transporter.sendMail({
    from: '"Badger Screen Printing ☄" <noreply@badgerscreenprinting.com>',
    to: userInfo.email,
    subject: "Confirm Email",
    // text: "Hello World, text.\nThis is more text.",
    html: htmlToSend
  });

  console.log('Message sent: %s', info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

const forgotPassTemp = fs.readFileSync(__dirname + '/forgotPassword.html', 'utf-8');
const compiledforgotPassTemp = handlebars.compile(forgotPassTemp);

const forgotPassword = async (userInfo) => {
  const transporter = await getTransporter()

  const replacements = {
    firstName: userInfo.firstName,
    confirmationID: userInfo.confirmationID
  }

  const htmlToSend = compiledforgotPassTemp(replacements);

  let info = await transporter.sendMail({
    from: '"Badger Screen Printing ☄" <noreply@badgerscreenprinting.com>',
    to: userInfo.email,
    subject: "Confirm Email",
    // text: "Hello World, text.\nThis is more text.",
    html: htmlToSend
  });

  console.log('Message sent: %s', info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

const orderConfirmationTemp = fs.readFileSync(__dirname + '/orderConfirmation.html', 'utf-8');
const compiledOrderConfirmationTemp = handlebars.compile(orderConfirmationTemp);

const orderLineTemp = fs.readFileSync(__dirname + '/orderLine.html', 'utf-8')
const compiledOredrLineTemp = handlebars.compile(orderLineTemp);

const orderConfirmation = async (email, items, subtotal, tax, totalCost) => {
  const transporter = await getTransporter()

  let lines = ''

  for (const i of items) {
    lines += compiledOredrLineTemp(i)
  }


  const replacements = {
    lineItems: lines,
    tax: tax,
    subtotal: subtotal,
    totalCost: totalCost,
    month: new Date().toDateString().substring(4, 7),
    year: new Date().toDateString().substring(11, 15)
  }

  const htmlToSend = compiledOrderConfirmationTemp(replacements);

  let info = transporter.sendMail({
    from: '"Badger Screen Printing ☄" <noreply@badgerscreenprinting.com>',
    to: email,
    subject: "Order Confirmation",
    html: htmlToSend,
    attachments: [
      {
        filename: 'badger-logo.png',
        path: './static/badger-logo.png',
        cid: 'badger-logo'
      },
      {
        filename: 'okok.gif',
        path: './static/okok.gif',
        cid: 'okok-gif'
      }
    ]
  })
  .then((res) => {
    console.log(res)
    console.log('Message sent: %s', info.messageId);
  })
  .catch((err) => {
    console.log(err)
  })

}

module.exports = {
  accountConfirmation,
  forgotPassword,
  orderConfirmation
}
