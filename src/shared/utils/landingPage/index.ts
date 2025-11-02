export function getLandingPage(): string {
  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="LetsApp - Organize sua agenda com amigos e colegas de forma simples e prática">
  <title>LetsApp - Organize sua agenda com facilidade</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 800px;
      width: 100%;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px 40px;
      text-align: center;
      color: white;
    }

    .logo {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .tagline {
      font-size: 20px;
      opacity: 0.95;
      font-weight: 300;
    }

    .content {
      padding: 50px 40px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #667eea;
    }

    .section-text {
      font-size: 18px;
      line-height: 1.7;
      color: #555;
      margin-bottom: 12px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }

    .feature {
      padding: 24px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .feature-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .feature-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .feature-text {
      font-size: 16px;
      color: #666;
      line-height: 1.5;
    }

    .store-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 40px;
      padding-top: 40px;
      border-top: 1px solid #e0e0e0;
    }

    .store-button {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 16px 32px;
      background: #000;
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .store-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }

    .store-button svg {
      width: 24px;
      height: 24px;
    }

    .footer {
      text-align: center;
      padding: 30px;
      background: #f8f9fa;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .header {
        padding: 40px 24px;
      }

      .logo {
        font-size: 36px;
      }

      .tagline {
        font-size: 18px;
      }

      .content {
        padding: 32px 24px;
      }

      .section-title {
        font-size: 24px;
      }

      .section-text {
        font-size: 16px;
      }

      .features {
        grid-template-columns: 1fr;
      }

      .store-buttons {
        flex-direction: column;
        align-items: stretch;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📅 LetsApp</div>
      <div class="tagline">Organize sua agenda com amigos e colegas</div>
    </div>

    <div class="content">
      <div class="section">
        <h2 class="section-title">O que é o LetsApp?</h2>
        <p class="section-text">
          O LetsApp é a solução perfeita para quem precisa organizar a agenda com outras pessoas. 
          Crie eventos, envie convites e sincronize tudo com seu calendário favorito.
        </p>
        <p class="section-text">
          Simples, prático e eficiente - tudo que você precisa para coordenar encontros e compromissos 
          com facilidade.
        </p>
      </div>

      <div class="section">
        <h2 class="section-title">Principais Funcionalidades</h2>
        <div class="features">
          <div class="feature">
            <div class="feature-icon">📆</div>
            <h3 class="feature-title">Sincronização Completa</h3>
            <p class="feature-text">
              Conecte com Google Calendar ou Outlook e tenha todos os seus eventos sincronizados automaticamente.
            </p>
          </div>

          <div class="feature">
            <div class="feature-icon">✉️</div>
            <h3 class="feature-title">Envio de Convites</h3>
            <p class="feature-text">
              Crie eventos e envie convites para amigos e colegas de forma rápida e intuitiva.
            </p>
          </div>

          <div class="feature">
            <div class="feature-icon">👥</div>
            <h3 class="feature-title">Gestão de Convidados</h3>
            <p class="feature-text">
              Veja quem confirmou presença, quem recusou e gerencie seus eventos com facilidade.
            </p>
          </div>

          <div class="feature">
            <div class="feature-icon">🔔</div>
            <h3 class="feature-title">Notificações</h3>
            <p class="feature-text">
              Receba notificações sobre novos convites e atualizações dos seus eventos.
            </p>
          </div>

          <div class="feature">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">Interface Simples</h3>
            <p class="feature-text">
              Design intuitivo e fácil de usar, pensado para facilitar o seu dia a dia.
            </p>
          </div>

          <div class="feature">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Seguro e Confiável</h3>
            <p class="feature-text">
              Seus dados estão protegidos com as melhores práticas de segurança.
            </p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Baixe Agora</h2>
        <p class="section-text" style="text-align: center;">
          Disponível para iOS e Android
        </p>
        <div class="store-buttons">
          <a href="#" class="store-button" title="Baixar na App Store">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
            </svg>
            <span>App Store</span>
          </a>
          <a href="#" class="store-button" title="Baixar na Google Play">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
            <span>Google Play</span>
          </a>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>&copy; 2025 LetsApp. Todos os direitos reservados.</p>
      <p style="margin-top: 8px;">
        <a href="/politica-de-privacidade" style="color: #667eea; text-decoration: none;">Política de Privacidade</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
