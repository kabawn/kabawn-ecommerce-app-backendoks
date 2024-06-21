const verificationEmailTemplate = (verificationUrl) => `
  <html>
    <body>
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Bienvenue chez notre service!</h2>
        <p>Merci de vous être inscrit. Veuillez vérifier votre adresse e-mail en cliquant sur le lien ci-dessous:</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Vérifiez votre adresse e-mail</a>
        </p>
        <p>Ou copiez et collez ce lien dans votre navigateur:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Merci,</p>
        <p>L'équipe de notre service</p>
      </div>
    </body>
  </html>
`;

module.exports = {
  verificationEmailTemplate,
};
